import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// TODO: Migrate to Firebase
import { supabase } from "@/lib/supabase-stub";
import { useToast } from "@/hooks/use-toast";
import { Clock, LogIn, LogOut, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";

interface AttendanceCheckInProps {
  employeeId: string;
}

const AttendanceCheckIn = ({ employeeId }: AttendanceCheckInProps) => {
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userIp, setUserIp] = useState<string>("");
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTodayAttendance();
    fetchUserIpAndCheckWhitelist();
  }, [employeeId]);

  const fetchUserIpAndCheckWhitelist = async () => {
    try {
      // Fetch current IP
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setUserIp(data.ip);

      // Check if IP is whitelisted
      const { data: whitelistData, error } = await supabase
        .from("ip_whitelist")
        .select("*")
        .eq("ip_address", data.ip)
        .eq("is_active", true)
        .single();

      if (!error && whitelistData) {
        setIsWhitelisted(true);
      } else {
        setIsWhitelisted(false);
      }
    } catch (error) {
      console.error("Error fetching IP:", error);
      setIsWhitelisted(false);
    }
  };

  const fetchTodayAttendance = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("date", today)
      .single();

    if (data) {
      setTodayAttendance(data);
    }
  };

  const handleCheckIn = async () => {
    if (!userIp) {
      toast({
        title: "Error",
        description: "Unable to detect your IP address. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!isWhitelisted) {
      toast({
        title: "Access Denied",
        description: "Your IP address is not authorized for check-in. Please contact your administrator.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    try {
      const { error } = await supabase.from("attendance").insert({
        employee_id: employeeId,
        date: today,
        check_in_time: now, // Full timestamp with timezone
        ip_address: userIp,
        status: "Present",
        manually_added: false,
      });

      if (error) throw error;

      toast({
        title: "Checked In",
        description: "You have successfully checked in for today.",
      });
      fetchTodayAttendance();
    } catch (error: any) {
      console.error("Check-in error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to check in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) return;

    setLoading(true);
    const now = new Date().toISOString();

    try {
      const { error } = await supabase
        .from("attendance")
        .update({ check_out_time: now })
        .eq("id", todayAttendance.id);

      if (error) throw error;

      toast({
        title: "Checked Out",
        description: "You have successfully checked out for today.",
      });
      fetchTodayAttendance();
    } catch (error: any) {
      console.error("Check-out error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to check out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isCheckedIn = todayAttendance && todayAttendance.check_in_time;
  const isCheckedOut = todayAttendance && todayAttendance.check_out_time;

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="text-primary" size={24} />
            Today's Attendance
          </CardTitle>
          <CardDescription>
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* IP Status */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin size={18} className={isWhitelisted ? "text-green-500" : "text-orange-500"} />
              <span className="text-sm font-medium">Network Status:</span>
            </div>
            <span className={`text-sm font-semibold ${isWhitelisted ? "text-green-600" : "text-orange-600"}`}>
              {isWhitelisted ? "Authorized Network" : "Unauthorized Network"}
            </span>
          </div>

          {/* Check-in Status */}
          {isCheckedIn && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <LogIn size={18} className="text-green-600" />
                  <span className="text-sm font-medium">Check-in Time:</span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {format(new Date(todayAttendance.check_in_time), "h:mm a")}
                </span>
              </div>

              {isCheckedOut && (
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <LogOut size={18} className="text-blue-600" />
                    <span className="text-sm font-medium">Check-out Time:</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    {format(new Date(todayAttendance.check_out_time), "h:mm a")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4">
            {!isCheckedIn ? (
              <Button
                onClick={handleCheckIn}
                disabled={loading || !isWhitelisted}
                className="w-full"
                size="lg"
              >
                <LogIn className="mr-2" size={20} />
                Check In
              </Button>
            ) : !isCheckedOut ? (
              <Button
                onClick={handleCheckOut}
                disabled={loading}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <LogOut className="mr-2" size={20} />
                Check Out
              </Button>
            ) : (
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">
                  You have completed your attendance for today.
                </p>
              </div>
            )}
          </div>

          {!isWhitelisted && !isCheckedIn && (
            <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-orange-700 dark:text-orange-400">
                Your IP address is not authorized for check-in. Please contact your administrator to whitelist this network.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-border bg-muted/50">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-2 text-sm">Attendance Guidelines:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Check-in is only available from authorized networks</li>
            <li>• Please check in when you arrive at the office</li>
            <li>• Remember to check out before leaving</li>
            <li>• If you forget to check in, contact your admin</li>
            <li>• Contact your admin to whitelist new office locations</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceCheckIn;
