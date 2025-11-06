import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
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
  const { toast } = useToast();

  // Office IP address - Change this to your actual office IP
  const OFFICE_IP = "103.191.240.122"; // Replace with your actual office IP address

  useEffect(() => {
    fetchTodayAttendance();
    fetchUserIp();
  }, [employeeId]);

  const fetchUserIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setUserIp(data.ip);
    } catch (error) {
      console.error("Error fetching IP:", error);
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

    if (userIp !== OFFICE_IP) {
      toast({
        title: "Access Denied",
        description: "You can only check in from the office network.",
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
        check_in_time: now.split('T')[1].split('.')[0], // Extract time only
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
    const timeOnly = now.split('T')[1].split('.')[0]; // Extract time only

    try {
      const { error } = await supabase
        .from("attendance")
        .update({ check_out_time: timeOnly })
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
  const isFromOffice = userIp === OFFICE_IP;

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
              <MapPin size={18} className={isFromOffice ? "text-green-500" : "text-orange-500"} />
              <span className="text-sm font-medium">Network Status:</span>
            </div>
            <span className={`text-sm font-semibold ${isFromOffice ? "text-green-600" : "text-orange-600"}`}>
              {isFromOffice ? "Office Network" : "External Network"}
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
                disabled={loading || !isFromOffice}
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

          {!isFromOffice && !isCheckedIn && (
            <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-orange-700 dark:text-orange-400">
                You must be connected to the office network to check in.
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
            <li>• Check-in is only available from the office network</li>
            <li>• Please check in when you arrive at the office</li>
            <li>• Remember to check out before leaving</li>
            <li>• If you forget to check in, contact your admin</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceCheckIn;
