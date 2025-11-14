"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2, Calendar, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LeaveType {
  id: string;
  name: string;
  days_allowed: number;
  impacts_salary: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export default function LeavePolicyManager() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // New leave type form state
  const [newLeaveType, setNewLeaveType] = useState({
    name: "",
    days_allowed: 0,
    impacts_salary: false,
    description: "",
  });

  useEffect(() => {
    fetchLeavePolicies();
  }, []);

  const fetchLeavePolicies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leave-policies');
      const result = await response.json();

      if (response.ok) {
        setLeaveTypes(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch leave policies');
      }
    } catch (error: any) {
      console.error("Error fetching leave policies:", error);
      toast({
        title: "Error loading leave policies",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLeaveType = async () => {
    if (!newLeaveType.name || newLeaveType.days_allowed <= 0) {
      toast({
        title: "Validation Error",
        description: "Please provide a valid name and days allowed",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/leave-policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeaveType),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Leave type added successfully",
        });
        setNewLeaveType({
          name: "",
          days_allowed: 0,
          impacts_salary: false,
          description: "",
        });
        fetchLeavePolicies();
      } else {
        throw new Error(result.error || 'Failed to add leave type');
      }
    } catch (error: any) {
      console.error("Error adding leave type:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLeaveType = async (id: string, updates: Partial<LeaveType>) => {
    try {
      const response = await fetch('/api/leave-policies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Leave type updated successfully",
        });
        fetchLeavePolicies();
      } else {
        throw new Error(result.error || 'Failed to update leave type');
      }
    } catch (error: any) {
      console.error("Error updating leave type:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteLeaveType = async (id: string) => {
    if (!confirm("Are you sure you want to delete this leave type?")) {
      return;
    }

    try {
      const response = await fetch('/api/leave-policies', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Leave type deleted successfully",
        });
        fetchLeavePolicies();
      } else {
        throw new Error(result.error || 'Failed to delete leave type');
      }
    } catch (error: any) {
      console.error("Error deleting leave type:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
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
          Configure leave types and their policies. Leave types marked as "Impacts Salary" will result in salary deductions when the allocated days are exceeded.
        </AlertDescription>
      </Alert>

      {/* Add New Leave Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Leave Type
          </CardTitle>
          <CardDescription>
            Define a new type of leave with its allowance and salary impact policy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Leave Type Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Casual Leave, Sick Leave"
                value={newLeaveType.name}
                onChange={(e) => setNewLeaveType({ ...newLeaveType, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="days">Days Allowed Per Year *</Label>
              <Input
                id="days"
                type="number"
                min="0"
                placeholder="e.g., 10"
                value={newLeaveType.days_allowed || ""}
                onChange={(e) => setNewLeaveType({ ...newLeaveType, days_allowed: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="e.g., Annual casual leave allowance"
                value={newLeaveType.description}
                onChange={(e) => setNewLeaveType({ ...newLeaveType, description: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2 md:col-span-2">
              <Switch
                id="impacts-salary"
                checked={newLeaveType.impacts_salary}
                onCheckedChange={(checked) => setNewLeaveType({ ...newLeaveType, impacts_salary: checked })}
              />
              <Label htmlFor="impacts-salary" className="cursor-pointer">
                Impacts salary when exceeded (deduct from salary if employee takes more than allowed days)
              </Label>
            </div>

            <div className="md:col-span-2">
              <Button onClick={handleAddLeaveType} disabled={saving} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                {saving ? "Adding..." : "Add Leave Type"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Leave Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Current Leave Policies
          </CardTitle>
          <CardDescription>
            Manage existing leave types and their allowances
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaveTypes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No leave types configured yet. Add your first leave type above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Days Allowed</TableHead>
                    <TableHead>Salary Impact</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveTypes.map((leaveType) => (
                    <TableRow key={leaveType.id}>
                      <TableCell className="font-medium">
                        <Input
                          value={leaveType.name}
                          onChange={(e) => {
                            const updated = leaveTypes.map(lt => 
                              lt.id === leaveType.id ? { ...lt, name: e.target.value } : lt
                            );
                            setLeaveTypes(updated);
                          }}
                          onBlur={() => handleUpdateLeaveType(leaveType.id, { name: leaveType.name })}
                          className="max-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={leaveType.days_allowed}
                          onChange={(e) => {
                            const updated = leaveTypes.map(lt => 
                              lt.id === leaveType.id ? { ...lt, days_allowed: parseInt(e.target.value) || 0 } : lt
                            );
                            setLeaveTypes(updated);
                          }}
                          onBlur={() => handleUpdateLeaveType(leaveType.id, { days_allowed: leaveType.days_allowed })}
                          className="max-w-[100px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={leaveType.impacts_salary}
                          onCheckedChange={(checked) => {
                            const updated = leaveTypes.map(lt => 
                              lt.id === leaveType.id ? { ...lt, impacts_salary: checked } : lt
                            );
                            setLeaveTypes(updated);
                            handleUpdateLeaveType(leaveType.id, { impacts_salary: checked });
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={leaveType.description || ""}
                          onChange={(e) => {
                            const updated = leaveTypes.map(lt => 
                              lt.id === leaveType.id ? { ...lt, description: e.target.value } : lt
                            );
                            setLeaveTypes(updated);
                          }}
                          onBlur={() => handleUpdateLeaveType(leaveType.id, { description: leaveType.description })}
                          placeholder="Add description"
                          className="max-w-[250px]"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteLeaveType(leaveType.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
}
