import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDocuments, createDocument, updateDocument } from "@/lib/firebase/firestore";
import { where } from "firebase/firestore";
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

      // Check if IP is whitelisted in Firebase
      const { data: whitelistData, error } = await getDocuments("ip_whitelist", [
        where("ip_address", "==", data.ip),
        where("is_active", "==", true)
      ]);

      if (!error && whitelistData && whitelistData.length > 0) {
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
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await getDocuments("attendance", [
        where("employee_id", "==", employeeId),
        where("date", "==", today)
      ]);

      if (error) {
        console.error("Error fetching today's attendance:", error);
        return;
      }

      if (data && data.length > 0) {
        setTodayAttendance(data[0]);
      }
    } catch (error) {
      console.error("Error in fetchTodayAttendance:", error);
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
    const now = new Date();

    try {
      const { error } = await createDocument("attendance", {
        employee_id: employeeId,
        date: today,
        check_in_time: now,
        ip_address: userIp,
        status: "Present",
        manually_added: false,
        created_at: now,
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
    const now = new Date();

    try {
      // Update check-out with current IP (even if not whitelisted)
      // This allows remote check-out if check-in was done or manual entry exists
      const { error } = await updateDocument("attendance", todayAttendance.id, {
        check_out_time: now,
        check_out_ip: userIp || null,
        remote_checkout: !isWhitelisted, // Flag if checked out remotely
        updated_at: now,
      });

      if (error) throw error;

      toast({
        title: "Checked Out",
        description: !isWhitelisted 
          ? "You have successfully checked out remotely for today."
          : "You have successfully checked out for today.",
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
                  {todayAttendance.check_in_time?.toDate?.()
                    ? format(todayAttendance.check_in_time.toDate(), "h:mm a")
                    : format(new Date(todayAttendance.check_in_time), "h:mm a")}
                </span>
              </div>

              {isCheckedOut && (
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <LogOut size={18} className="text-blue-600" />
                    <span className="text-sm font-medium">Check-out Time:</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    {todayAttendance.check_out_time?.toDate?.()
                      ? format(todayAttendance.check_out_time.toDate(), "h:mm a")
                      : format(new Date(todayAttendance.check_out_time), "h:mm a")}
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

          {!isWhitelisted && isCheckedIn && !isCheckedOut && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                ✓ You can check out from any network. Remote check-outs are allowed.
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
            <li>• Check-out can be done from anywhere (office or remote)</li>
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
