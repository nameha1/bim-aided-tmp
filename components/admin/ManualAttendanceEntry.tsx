import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// TODO: Migrate to Firebase
import { supabase } from "@/lib/supabase-stub";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ManualAttendanceEntryProps {
  onSuccess?: () => void;
}

const ManualAttendanceEntry = ({ onSuccess }: ManualAttendanceEntryProps) => {
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    employee_id: string;
    date: Date;
    check_in_time: string;
    check_out_time: string;
    status: "Present" | "Absent" | "Leave" | "Late";
    admin_notes: string;
  }>({
    employee_id: "",
    date: new Date(),
    check_in_time: "",
    check_out_time: "",
    status: "Present",
    admin_notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchEmployees();
    }
  }, [open]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name")
        .eq("employment_status", "Active")
        .order("first_name");

      if (error) {
        console.error("Error fetching employees:", error);
        toast({
          title: "Error",
          description: "Failed to load employees list",
          variant: "destructive",
        });
        return;
      }

      console.log("Fetched employees:", data);
      setEmployees(data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get admin employee id
      const { data: adminEmployee } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const dateString = format(formData.date, "yyyy-MM-dd");

      // Check if attendance already exists
      const { data: existing } = await supabase
        .from("attendance")
        .select("id")
        .eq("employee_id", formData.employee_id)
        .eq("date", dateString)
        .single();

      // Convert time strings to full timestamps
      const check_in_timestamp = formData.check_in_time
        ? `${dateString}T${formData.check_in_time}:00Z`
        : null;
      const check_out_timestamp = formData.check_out_time
        ? `${dateString}T${formData.check_out_time}:00Z`
        : null;

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("attendance")
          .update({
            check_in_time: check_in_timestamp,
            check_out_time: check_out_timestamp,
            status: formData.status,
            manually_added: true,
            admin_approved: true,
            admin_approved_by: adminEmployee?.id,
            admin_approved_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase.from("attendance").insert({
          employee_id: formData.employee_id,
          date: dateString,
          check_in_time: check_in_timestamp,
          check_out_time: check_out_timestamp,
          status: formData.status,
          manually_added: true,
          admin_approved: true,
          admin_approved_by: adminEmployee?.id,
          admin_approved_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Attendance record has been added successfully.",
      });

      setOpen(false);
      setFormData({
        employee_id: "",
        date: new Date(),
        check_in_time: "",
        check_out_time: "",
        status: "Present",
        admin_notes: "",
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error adding attendance:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add attendance record.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2" size={18} />
          Add Manual Attendance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Manual Attendance</DialogTitle>
            <DialogDescription>
              Manually add or update attendance for an employee
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Employee Selection */}
            <div className="space-y-2">
              <Label htmlFor="employee">Employee *</Label>
              <Select
                value={formData.employee_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, employee_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No active employees found
                    </div>
                  ) : (
                    employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && setFormData({ ...formData, date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Check-in Time */}
            <div className="space-y-2">
              <Label htmlFor="check_in">Check-in Time (optional)</Label>
              <Input
                id="check_in"
                type="time"
                value={formData.check_in_time}
                onChange={(e) =>
                  setFormData({ ...formData, check_in_time: e.target.value })
                }
              />
            </div>

            {/* Check-out Time */}
            <div className="space-y-2">
              <Label htmlFor="check_out">Check-out Time (optional)</Label>
              <Input
                id="check_out"
                type="time"
                value={formData.check_out_time}
                onChange={(e) =>
                  setFormData({ ...formData, check_out_time: e.target.value })
                }
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "Present" | "Absent" | "Leave" | "Late") =>
                  setFormData({ ...formData, status: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Leave">Leave</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Admin Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this attendance entry..."
                value={formData.admin_notes}
                onChange={(e) =>
                  setFormData({ ...formData, admin_notes: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Attendance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManualAttendanceEntry;
