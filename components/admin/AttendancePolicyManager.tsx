"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Clock, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface AttendancePolicy {
  id?: string;
  office_start_time: string;       // Format: "09:00"
  office_end_time: string;         // Format: "18:00"
  grace_period_minutes: number;    // e.g., 15 minutes
  late_arrivals_per_day: number;   // e.g., 3 late arrivals = 1 day deduction
  created_at?: string;
  updated_at?: string;
}

export default function AttendancePolicyManager() {
  const [policy, setPolicy] = useState<AttendancePolicy>({
    office_start_time: "09:00",
    office_end_time: "18:00",
    grace_period_minutes: 15,
    late_arrivals_per_day: 3,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAttendancePolicy();
  }, []);

  const fetchAttendancePolicy = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/attendance-policy');
      const result = await response.json();

      if (response.ok && result.data) {
        setPolicy(result.data);
      } else if (response.status === 404) {
        // No policy exists yet, use defaults
        console.log('No attendance policy found, using defaults');
      } else {
        throw new Error(result.error || 'Failed to fetch attendance policy');
      }
    } catch (error: any) {
      console.error("Error fetching attendance policy:", error);
      toast({
        title: "Error loading policy",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePolicy = async () => {
    // Validation
    if (!policy.office_start_time || !policy.office_end_time) {
      toast({
        title: "Validation Error",
        description: "Please provide both start and end times",
        variant: "destructive",
      });
      return;
    }

    if (policy.grace_period_minutes < 0 || policy.grace_period_minutes > 120) {
      toast({
        title: "Validation Error",
        description: "Grace period must be between 0 and 120 minutes",
        variant: "destructive",
      });
      return;
    }

    if (policy.late_arrivals_per_day < 1 || policy.late_arrivals_per_day > 30) {
      toast({
        title: "Validation Error",
        description: "Late arrivals per day must be between 1 and 30",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/attendance-policy', {
        method: policy.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Attendance policy saved successfully",
        });
        setPolicy(result.data);
      } else {
        throw new Error(result.error || 'Failed to save attendance policy');
      }
    } catch (error: any) {
      console.error("Error saving attendance policy:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const calculateExampleLateTime = () => {
    const [hours, minutes] = policy.office_start_time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + policy.grace_period_minutes;
    const lateHours = Math.floor(totalMinutes / 60);
    const lateMinutes = totalMinutes % 60;
    return `${lateHours.toString().padStart(2, '0')}:${lateMinutes.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Configure office hours and late arrival policies. Late arrivals beyond the grace period will be tracked and can result in salary deductions.
        </AlertDescription>
      </Alert>

      {/* Office Hours Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Office Hours Configuration
          </CardTitle>
          <CardDescription>
            Set the official working hours for your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start-time">Office Start Time *</Label>
              <Input
                id="start-time"
                type="time"
                value={policy.office_start_time}
                onChange={(e) => setPolicy({ ...policy, office_start_time: e.target.value })}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Official start time for the workday
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">Office End Time *</Label>
              <Input
                id="end-time"
                type="time"
                value={policy.office_end_time}
                onChange={(e) => setPolicy({ ...policy, office_end_time: e.target.value })}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Official end time for the workday
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-cyan-500 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Current Office Hours:</strong> {policy.office_start_time} - {policy.office_end_time}
                <br />
                <span className="text-xs text-blue-700 dark:text-blue-300">
                  Total working hours: {(() => {
                    const [startH, startM] = policy.office_start_time.split(':').map(Number);
                    const [endH, endM] = policy.office_end_time.split(':').map(Number);
                    const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    return `${hours}h ${minutes}m`;
                  })()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Late Arrival Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Late Arrival Policy
          </CardTitle>
          <CardDescription>
            Configure grace period and penalty rules for late arrivals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="grace-period">Grace Period (Minutes) *</Label>
              <Input
                id="grace-period"
                type="number"
                min="0"
                max="120"
                value={policy.grace_period_minutes}
                onChange={(e) => setPolicy({ ...policy, grace_period_minutes: parseInt(e.target.value) || 0 })}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Employees arriving within this period won't be marked as late (0-120 minutes)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="late-arrivals">Late Arrivals = 1 Day Deduction *</Label>
              <Input
                id="late-arrivals"
                type="number"
                min="1"
                max="30"
                value={policy.late_arrivals_per_day}
                onChange={(e) => setPolicy({ ...policy, late_arrivals_per_day: parseInt(e.target.value) || 3 })}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Number of late arrivals that equals one day salary deduction (1-30)
              </p>
            </div>
          </div>

          <Separator />

          {/* Policy Summary */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Policy Summary:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      ✓ On Time Arrival
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Arriving between {policy.office_start_time} and {calculateExampleLateTime()}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      <strong>No penalty</strong> - Within grace period
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      ⚠ Late Arrival
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                      Arriving after {calculateExampleLateTime()}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                      <strong>Counted as late</strong> - Tracked for deduction
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Salary Deduction Rule:</strong> Every {policy.late_arrivals_per_day} late arrivals will be counted as 1 day absent for salary calculation purposes.
                <br />
                <span className="text-xs text-muted-foreground mt-1 block">
                  Example: If an employee is late {policy.late_arrivals_per_day} times in a month, their salary will be deducted by 1 day's worth.
                </span>
              </AlertDescription>
            </Alert>
          </div>

          <Separator />

          {/* Example Calculation */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-3">Example Scenario:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee arrives at:</span>
                <span className="font-medium">{calculateExampleLateTime()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-green-600">On Time (within grace period)</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee arrives at:</span>
                <span className="font-medium">{(() => {
                  const [hours, minutes] = policy.office_start_time.split(':').map(Number);
                  const totalMinutes = hours * 60 + minutes + policy.grace_period_minutes + 1;
                  const lateHours = Math.floor(totalMinutes / 60);
                  const lateMinutes = totalMinutes % 60;
                  return `${lateHours.toString().padStart(2, '0')}:${lateMinutes.toString().padStart(2, '0')}`;
                })()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-orange-600">Late (beyond grace period)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">After {policy.late_arrivals_per_day} such instances:</span>
                <span className="font-medium text-red-600">1 day salary deduction</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleSavePolicy} 
              disabled={saving}
              size="lg"
              className="w-full md:w-auto"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Attendance Policy"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            How This Works
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Employees check in daily through the attendance system</li>
            <li>Check-in time is compared against office start time + grace period</li>
            <li>Late arrivals beyond grace period are automatically tracked</li>
            <li>When an employee accumulates {policy.late_arrivals_per_day} late arrivals, it equals 1 day deduction</li>
            <li>Payroll system automatically calculates deductions based on late arrival count</li>
            <li>Admin can view late arrival reports in the attendance records</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
