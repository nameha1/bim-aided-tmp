"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getDocuments } from "@/lib/firebase/firestore";
import { where } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Calendar, FileText, AlertCircle, Check, Clock, X } from "lucide-react";

interface LeaveBalanceDisplayProps {
  employeeId: string;
}

interface LeaveBalance {
  casualLeaveTotal: number;
  casualLeaveUsed: number;
  casualLeaveRemaining: number;
  sickLeaveTotal: number;
  sickLeaveUsed: number;
  sickLeaveRemaining: number;
  unpaidLeaveDays: number;
}

interface LeaveRequest {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: any;
  supporting_document_url?: string;
  admin_approved?: boolean;
  supervisor_approved?: boolean;
  rejection_reason?: string;
}

const LeaveBalanceDisplay = ({ employeeId }: LeaveBalanceDisplayProps) => {
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaveData();
  }, [employeeId]);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      
      // Fetch leave balance for current year
      const currentYear = new Date().getFullYear();
      const { data: balanceData } = await getDocuments('leave_balances', [
        where('employee_id', '==', employeeId),
        where('year', '==', currentYear)
      ]);

      if (balanceData && balanceData.length > 0) {
        const balance = balanceData[0];
        setLeaveBalance({
          casualLeaveTotal: balance.casual_leave_total || 10,
          casualLeaveUsed: balance.casual_leave_used || 0,
          casualLeaveRemaining: balance.casual_leave_remaining || 10,
          sickLeaveTotal: balance.sick_leave_total || 10,
          sickLeaveUsed: balance.sick_leave_used || 0,
          sickLeaveRemaining: balance.sick_leave_remaining || 10,
          unpaidLeaveDays: balance.unpaid_leave_days || 0,
        });
      } else {
        // Default balances
        setLeaveBalance({
          casualLeaveTotal: 10,
          casualLeaveUsed: 0,
          casualLeaveRemaining: 10,
          sickLeaveTotal: 10,
          sickLeaveUsed: 0,
          sickLeaveRemaining: 10,
          unpaidLeaveDays: 0,
        });
      }

      // Fetch leave history
      const { data: leaveData } = await getDocuments('leave_requests', [
        where('employee_id', '==', employeeId)
      ]);

      if (leaveData) {
        // Sort by created date descending
        const sortedLeaves = leaveData.sort((a: any, b: any) => {
          const dateA = a.created_at?.toDate?.() || new Date(a.created_at || 0);
          const dateB = b.created_at?.toDate?.() || new Date(b.created_at || 0);
          return dateB.getTime() - dateA.getTime();
        });
        setLeaveHistory(sortedLeaves as LeaveRequest[]);
      }
    } catch (error: any) {
      console.error("Error fetching leave data:", error);
      toast({
        title: "Error",
        description: "Failed to load leave data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, adminApproved?: boolean, supervisorApproved?: boolean) => {
    if (status === 'approved' || adminApproved) {
      return <Badge variant="default" className="gap-1"><Check size={14} /> Approved</Badge>;
    } else if (status === 'rejected') {
      return <Badge variant="destructive" className="gap-1"><X size={14} /> Rejected</Badge>;
    } else if (status === 'pending_supervisor' || (!supervisorApproved && status !== 'approved')) {
      return <Badge variant="secondary" className="gap-1"><Clock size={14} /> Pending Supervisor</Badge>;
    } else if (status === 'pending_admin') {
      return <Badge variant="secondary" className="gap-1"><Clock size={14} /> Pending Admin</Badge>;
    } else {
      return <Badge variant="outline" className="gap-1"><Clock size={14} /> Pending</Badge>;
    }
  };

  const getLeaveTypeBadge = (leaveType: string) => {
    const colors: Record<string, string> = {
      'casual': 'bg-blue-100 text-blue-800 border-blue-300',
      'Casual Leave': 'bg-blue-100 text-blue-800 border-blue-300',
      'sick': 'bg-red-100 text-red-800 border-red-300',
      'Sick Leave': 'bg-red-100 text-red-800 border-red-300',
      'unpaid': 'bg-gray-100 text-gray-800 border-gray-300',
      'Unpaid Leave': 'bg-gray-100 text-gray-800 border-gray-300',
      'emergency': 'bg-orange-100 text-orange-800 border-orange-300',
      'Emergency Leave': 'bg-orange-100 text-orange-800 border-orange-300',
      'annual': 'bg-green-100 text-green-800 border-green-300',
      'Annual Leave': 'bg-green-100 text-green-800 border-green-300',
    };
    
    const colorClass = colors[leaveType] || 'bg-purple-100 text-purple-800 border-purple-300';
    
    return (
      <Badge variant="outline" className={colorClass}>
        {leaveType}
      </Badge>
    );
  };

  const calculateLeaveDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
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
      {/* Leave Balance Summary */}
      {leaveBalance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Casual Leave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {leaveBalance.casualLeaveRemaining}
              </div>
              <p className="text-xs text-blue-700 mt-1">
                of {leaveBalance.casualLeaveTotal} days remaining
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Used: {leaveBalance.casualLeaveUsed} days
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-900 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Sick Leave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {leaveBalance.sickLeaveRemaining}
              </div>
              <p className="text-xs text-red-700 mt-1">
                of {leaveBalance.sickLeaveTotal} days remaining
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Used: {leaveBalance.sickLeaveUsed} days
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-gray-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Unpaid Leave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">
                {leaveBalance.unpaidLeaveDays}
              </div>
              <p className="text-xs text-gray-700 mt-1">
                days taken this year
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (After exceeding limits)
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Leave Policy:</strong> Casual and Sick leaves are paid leaves (no salary deduction). 
          When you exceed your allocated leave balance, additional days will be marked as unpaid leave 
          and will be deducted from your salary at the daily rate (Gross Salary ÷ Working Days).
        </AlertDescription>
      </Alert>

      {/* Leave History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Leave Request History
          </CardTitle>
          <CardDescription>
            View all your leave requests and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaveHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No leave requests yet. Submit your first leave request above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead className="text-center">Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveHistory.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>
                        {getLeaveTypeBadge(leave.leave_type)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        {calculateLeaveDays(leave.start_date, leave.end_date)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {leave.reason}
                        {leave.rejection_reason && (
                          <div className="text-xs text-red-600 mt-1">
                            Rejection: {leave.rejection_reason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(leave.status, leave.admin_approved, leave.supervisor_approved)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {leave.created_at?.toDate?.().toLocaleDateString() || 
                         new Date(leave.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveBalanceDisplay;
