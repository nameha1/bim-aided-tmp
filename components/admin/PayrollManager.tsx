import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDocuments, updateDocument, createDocument } from "@/lib/firebase/firestore";
import { where } from "firebase/firestore";
import { auth } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, Check, X, RefreshCw, DollarSign, Settings, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PayrollSettingsProps {
  config: Record<string, string>;
  onSave: (config: Record<string, string>) => void;
  loading: boolean;
}

const PayrollSettings = ({ config, onSave, loading }: PayrollSettingsProps) => {
  const [formData, setFormData] = useState(config);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="annual_casual_leave">Annual Casual Leave Days</Label>
          <Input
            id="annual_casual_leave"
            type="number"
            min="0"
            value={formData.annual_casual_leave || '10'}
            onChange={(e) => handleChange('annual_casual_leave', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Number of casual leave days granted per year
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="annual_sick_leave">Annual Sick Leave Days</Label>
          <Input
            id="annual_sick_leave"
            type="number"
            min="0"
            value={formData.annual_sick_leave || '10'}
            onChange={(e) => handleChange('annual_sick_leave', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Number of sick leave days granted per year
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="late_tolerance_count">Late Tolerance Count</Label>
          <Input
            id="late_tolerance_count"
            type="number"
            min="1"
            value={formData.late_tolerance_count || '3'}
            onChange={(e) => handleChange('late_tolerance_count', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Number of late arrivals before 1 day salary deduction
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="working_days_per_month">Working Days per Month</Label>
          <Input
            id="working_days_per_month"
            type="number"
            min="20"
            max="31"
            value={formData.working_days_per_month || '30'}
            onChange={(e) => handleChange('working_days_per_month', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Standard working days used for salary calculation
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="half_day_hours">Half Day Hours</Label>
          <Input
            id="half_day_hours"
            type="number"
            min="1"
            max="12"
            value={formData.half_day_hours || '4'}
            onChange={(e) => handleChange('half_day_hours', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Hours that constitute a half day of work
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_day_hours">Full Day Hours</Label>
          <Input
            id="full_day_hours"
            type="number"
            min="1"
            max="24"
            value={formData.full_day_hours || '8'}
            onChange={(e) => handleChange('full_day_hours', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Hours that constitute a full day of work
          </p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Salary Calculation Formula</h4>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <p>• <strong>Daily Rate</strong> = Basic Salary ÷ Working Days per Month</p>
          <p>• <strong>Late Penalty</strong> = (Total Late Days ÷ Late Tolerance) × Daily Rate</p>
          <p>• <strong>Unpaid Leave Deduction</strong> = Unpaid Days × Daily Rate</p>
          <p>• <strong>Net Salary</strong> = Basic Salary - Total Deductions</p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
};

const PayrollManager = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedPayrolls, setSelectedPayrolls] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [salaryConfig, setSalaryConfig] = useState<Record<string, string>>({});
  const [configLoading, setConfigLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast } = useToast();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  useEffect(() => {
    fetchCurrentUser();
    fetchPayrollData();
    fetchSalaryConfig();
  }, [selectedMonth, selectedYear]);

  const fetchCurrentUser = async () => {
    try {
      // Get session from API instead of client auth
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();

      if (sessionData.user && sessionData.user.email) {
        const { data: employees } = await getDocuments('employees', [
          where('email', '==', sessionData.user.email)
        ]);
        if (employees && employees.length > 0) {
          setCurrentUser(employees[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      // Fetch all active employees
      const { data: allEmployees, error: empError } = await getDocuments('employees', [
        where('status', '==', 'active')
      ]);

      if (empError) throw empError;

      // Fetch existing payroll records for the selected month/year
      const { data: existingPayroll, error: payrollError } = await getDocuments('payroll', [
        where('month', '==', parseInt(selectedMonth)),
        where('year', '==', parseInt(selectedYear))
      ]);

      if (payrollError) throw payrollError;

      // Create a map of existing payroll by employee_id
      const payrollMap = new Map();
      (existingPayroll || []).forEach((p: any) => {
        payrollMap.set(p.employee_id, p);
      });

      // Merge employees with their payroll data (or create empty payroll structure)
      const mergedData = (allEmployees || []).map((employee: any) => {
        const existingRecord = payrollMap.get(employee.id);
        
        if (existingRecord) {
          return {
            ...existingRecord,
            employee: employee
          };
        } else {
          // Create a new empty payroll record structure
          return {
            id: `temp_${employee.id}_${selectedMonth}_${selectedYear}`, // Temporary ID until saved
            employee_id: employee.id,
            employee: employee,
            month: parseInt(selectedMonth),
            year: parseInt(selectedYear),
            basic_salary: employee.gross_salary || employee.salary || 0,
            festival_bonus: 0,
            loan_deduction: 0,
            lunch_subsidy: 0,
            ait: 0,
            total_present_days: 0,
            total_absent_days: 0,
            total_late_days: 0,
            unpaid_leave_days: 0,
            total_deduction: 0,
            net_payable_salary: employee.gross_salary || employee.salary || 0,
            status: 'pending',
            is_new: true // Flag to indicate this hasn't been saved yet
          };
        }
      });

      setPayrollData(mergedData || []);
    } catch (error: any) {
      toast({
        title: "Error loading payroll",
        description: error.message || "Failed to load payroll data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryConfig = async () => {
    try {
      const { data, error } = await getDocuments('payroll_settings');

      if (error) throw error;

      const configMap = (data as any)?.reduce((acc: any, item: any) => {
        acc[item.config_key] = item.config_value;
        return acc;
      }, {} as Record<string, string>) || {};

      setSalaryConfig(configMap);
    } catch (error: any) {
      console.error("Error loading salary config:", error);
      // Set default config if none exists
      setSalaryConfig({
        annual_casual_leave: '10',
        annual_sick_leave: '10',
        late_tolerance_count: '3',
        working_days_per_month: '30',
        half_day_hours: '4',
        full_day_hours: '8'
      });
    }
  };

  const updateSalaryConfig = async (updates: Record<string, string>) => {
    setConfigLoading(true);
    try {
      // Update each config as a separate document
      const promises = Object.entries(updates).map(async ([key, value]) => {
        const { data: existing } = await getDocuments('payroll_settings', [
          where('config_key', '==', key)
        ]);

        if (existing && existing.length > 0) {
          // Update existing
          return updateDocument('payroll_settings', existing[0].id, {
            config_value: value,
            updated_at: new Date().toISOString()
          });
        } else {
          // Create new
          return createDocument('payroll_settings', {
            config_key: key,
            config_value: value,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      });

      await Promise.all(promises);

      toast({
        title: "Settings updated",
        description: "Payroll configuration has been saved successfully",
      });

      setSalaryConfig(updates);
      setSettingsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error updating settings",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setConfigLoading(false);
    }
  };

  const generatePayroll = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/payroll/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: parseInt(selectedMonth),
          year: parseInt(selectedYear)
        })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      toast({
        title: "Payroll Generated",
        description: result.message,
      });

      fetchPayrollData();
    } catch (error: any) {
      toast({
        title: "Error generating payroll",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const approvePayroll = async (action: 'approve' | 'reject') => {
    if (selectedPayrolls.length === 0) {
      toast({
        title: "No payrolls selected",
        description: "Please select at least one payroll record to process",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/payroll/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payrollIds: selectedPayrolls,
          action,
          approvedBy: currentUser?.id
        })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      toast({
        title: `Payroll ${action}d`,
        description: result.message,
      });

      setSelectedPayrolls([]);
      fetchPayrollData();
    } catch (error: any) {
      toast({
        title: `Error ${action}ing payroll`,
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportToExcel = () => {
    const headers = [
      "SL",
      "Employee Name",
      "Employee ID",
      "Designation",
      "Month",
      "Gross Salary",
      "Festival Bonus",
      "Loan Deduction",
      "Lunch Subsidy",
      "AIT",
      "Total Deduction",
      "Total Payable",
      "Disbursement",
      "Account Details",
      "Account Number",
      "Status",
      "Remarks"
    ];

    const rows = payrollData.map((p, index) => [
      index + 1, // SL
      p.employee?.name || '-',
      p.employee?.eid || '-',
      p.employee?.designation || '-',
      `${months.find(m => m.value === selectedMonth)?.label}, ${selectedYear}`,
      p.basic_salary,
      p.festival_bonus || 0,
      p.loan_deduction || 0,
      p.lunch_subsidy || 0,
      p.ait || 0,
      p.total_deduction,
      p.net_payable_salary,
      '', // Disbursement date (to be filled manually)
      '', // Account Details
      '', // Account Number
      p.status,
      '' // Remarks
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Salary_Disbursement_${months.find(m => m.value === selectedMonth)?.label}_${selectedYear}.csv`;
    a.click();
  };

  const toggleSelectAll = () => {
    if (selectedPayrolls.length === payrollData.length) {
      setSelectedPayrolls([]);
    } else {
      setSelectedPayrolls(payrollData.map(p => p.id));
    }
  };

  const toggleSelectPayroll = (id: string) => {
    setSelectedPayrolls(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "outline",
      approved: "default",
      paid: "default",
      rejected: "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{status.toUpperCase()}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculatePayrollTotals = (payroll: any, field: string, value: number) => {
    // Create updated payroll object with new value
    const updated = { ...payroll, [field]: value };
    
    // Get values
    const festivalBonus = updated.festival_bonus || 0;
    const loanDeduction = updated.loan_deduction || 0;
    const lunchSubsidy = updated.lunch_subsidy || 0;
    const ait = updated.ait || 0;
    
    // Get deductions from generation (these come from API)
    const latePenalty = updated.late_penalty || 0;
    const unpaidLeaveDeduction = updated.unpaid_leave_deduction || 0;
    const halfDayDeduction = updated.half_day_deduction || 0;
    const absentDeduction = updated.absent_deduction || 0;
    
    // Calculate total deduction: automated deductions + manual deductions - bonuses/subsidies
    const totalDeduction = latePenalty + unpaidLeaveDeduction + halfDayDeduction + absentDeduction + loanDeduction + ait - festivalBonus - lunchSubsidy;
    
    // Calculate net payable
    const netPayable = Math.max(0, updated.basic_salary - totalDeduction);
    
    return {
      total_deduction: totalDeduction,
      net_payable_salary: netPayable
    };
  };

  const updatePayrollField = async (payrollId: string, field: string, value: number) => {
    try {
      const payroll = payrollData.find(p => p.id === payrollId);
      if (!payroll) return;

      // Calculate updated totals
      const calculatedTotals = calculatePayrollTotals(payroll, field, value);

      // If this is a new record (not yet in database), create it first
      if (payroll.is_new) {
        const newPayrollData = {
          employee_id: payroll.employee_id,
          month: payroll.month,
          year: payroll.year,
          basic_salary: payroll.basic_salary,
          festival_bonus: field === 'festival_bonus' ? value : (payroll.festival_bonus || 0),
          loan_deduction: field === 'loan_deduction' ? value : (payroll.loan_deduction || 0),
          lunch_subsidy: field === 'lunch_subsidy' ? value : (payroll.lunch_subsidy || 0),
          ait: field === 'ait' ? value : (payroll.ait || 0),
          total_present_days: payroll.total_present_days || 0,
          total_absent_days: payroll.total_absent_days || 0,
          total_late_days: payroll.total_late_days || 0,
          unpaid_leave_days: payroll.unpaid_leave_days || 0,
          late_penalty: payroll.late_penalty || 0,
          unpaid_leave_deduction: payroll.unpaid_leave_deduction || 0,
          half_day_deduction: payroll.half_day_deduction || 0,
          absent_deduction: payroll.absent_deduction || 0,
          total_deduction: calculatedTotals.total_deduction,
          net_payable_salary: calculatedTotals.net_payable_salary,
          status: 'pending',
          created_at: new Date().toISOString()
        };

        const { data: newId, error: createError } = await createDocument('payroll', newPayrollData);
        
        if (createError) throw createError;

        // Update local state with the new real ID and calculated values
        setPayrollData(prev => prev.map(p => 
          p.id === payrollId ? { 
            ...p, 
            id: newId, 
            [field]: value, 
            ...calculatedTotals,
            is_new: false 
          } : p
        ));

        toast({
          title: "Payroll record created",
          description: `${field.replace(/_/g, ' ')} saved successfully`,
        });
      } else {
        // Update existing record with recalculated totals
        const { error } = await updateDocument('payroll', payrollId, {
          [field]: value,
          ...calculatedTotals,
          updated_at: new Date().toISOString()
        });

        if (error) throw error;

        // Update local state with recalculated values
        setPayrollData(prev => prev.map(p => 
          p.id === payrollId ? { 
            ...p, 
            [field]: value,
            ...calculatedTotals
          } : p
        ));

        toast({
          title: "Updated",
          description: `${field.replace(/_/g, ' ')} updated successfully`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error updating field",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payroll Management
              </CardTitle>
              <CardDescription>
                View all employees and manage monthly salary disbursements. Add bonuses, deductions, and other details directly.
              </CardDescription>
            </div>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Payroll System Configuration</DialogTitle>
                  <DialogDescription>
                    Configure the rules and parameters for automated salary calculation
                  </DialogDescription>
                </DialogHeader>
                <PayrollSettings
                  config={salaryConfig}
                  onSave={updateSalaryConfig}
                  loading={configLoading}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {[currentYear - 1, currentYear, currentYear + 1].map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={exportToExcel} variant="outline" disabled={payrollData.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>

          {selectedPayrolls.length > 0 && (
            <div className="flex gap-2">
              <Button onClick={() => approvePayroll('approve')} variant="default">
                <Check className="h-4 w-4 mr-2" />
                Approve Selected ({selectedPayrolls.length})
              </Button>
              <Button onClick={() => approvePayroll('reject')} variant="destructive">
                <X className="h-4 w-4 mr-2" />
                Reject Selected ({selectedPayrolls.length})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">Loading employee data...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPayrolls.length === payrollData.length && payrollData.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead className="text-right">Gross Salary</TableHead>
                    <TableHead className="text-right w-32">Festival Bonus</TableHead>
                    <TableHead className="text-right w-32">Loan Deduction</TableHead>
                    <TableHead className="text-right w-32">Lunch Subsidy</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                    <TableHead className="text-center">Late</TableHead>
                    <TableHead className="text-center">Unpaid Leave</TableHead>
                    <TableHead className="text-right">AIT</TableHead>
                    <TableHead className="text-right">Total Deduction</TableHead>
                    <TableHead className="text-right">Total Payable</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollData.map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPayrolls.includes(payroll.id)}
                          onCheckedChange={() => toggleSelectPayroll(payroll.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {payroll.employee?.name || '-'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {payroll.employee?.eid || '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {payroll.employee?.designation || '-'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {payroll.employee?.department || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(payroll.basic_salary)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={payroll.festival_bonus || 0}
                          onChange={(e) => updatePayrollField(payroll.id, 'festival_bonus', parseFloat(e.target.value) || 0)}
                          className="w-28 text-right"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={payroll.loan_deduction || 0}
                          onChange={(e) => updatePayrollField(payroll.id, 'loan_deduction', parseFloat(e.target.value) || 0)}
                          className="w-28 text-right"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={payroll.lunch_subsidy || 0}
                          onChange={(e) => updatePayrollField(payroll.id, 'lunch_subsidy', parseFloat(e.target.value) || 0)}
                          className="w-28 text-right"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className="text-center">{payroll.total_present_days}</TableCell>
                      <TableCell className="text-center">{payroll.total_absent_days}</TableCell>
                      <TableCell className="text-center">{payroll.total_late_days}</TableCell>
                      <TableCell className="text-center">{payroll.unpaid_leave_days}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={payroll.ait || 0}
                          onChange={(e) => updatePayrollField(payroll.id, 'ait', parseFloat(e.target.value) || 0)}
                          className="w-28 text-right"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        <div className="flex items-center justify-end gap-1">
                          <span>-{formatCurrency(payroll.total_deduction)}</span>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Info className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Deduction Breakdown</h4>
                                <div className="space-y-1 text-sm">
                                  {payroll.late_penalty > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Late Penalty:</span>
                                      <span className="text-red-600">-{formatCurrency(payroll.late_penalty)}</span>
                                    </div>
                                  )}
                                  {payroll.unpaid_leave_deduction > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Unpaid Leave:</span>
                                      <span className="text-red-600">-{formatCurrency(payroll.unpaid_leave_deduction)}</span>
                                    </div>
                                  )}
                                  {payroll.half_day_deduction > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Half Days:</span>
                                      <span className="text-red-600">-{formatCurrency(payroll.half_day_deduction)}</span>
                                    </div>
                                  )}
                                  {payroll.absent_deduction > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Absent Days:</span>
                                      <span className="text-red-600">-{formatCurrency(payroll.absent_deduction)}</span>
                                    </div>
                                  )}
                                  {payroll.loan_deduction > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Loan Deduction:</span>
                                      <span className="text-red-600">-{formatCurrency(payroll.loan_deduction)}</span>
                                    </div>
                                  )}
                                  {payroll.ait > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">AIT:</span>
                                      <span className="text-red-600">-{formatCurrency(payroll.ait)}</span>
                                    </div>
                                  )}
                                  {payroll.festival_bonus > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Festival Bonus:</span>
                                      <span className="text-green-600">+{formatCurrency(payroll.festival_bonus)}</span>
                                    </div>
                                  )}
                                  {payroll.lunch_subsidy > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Lunch Subsidy:</span>
                                      <span className="text-green-600">+{formatCurrency(payroll.lunch_subsidy)}</span>
                                    </div>
                                  )}
                                  <div className="border-t pt-1 mt-2">
                                    <div className="flex justify-between font-semibold">
                                      <span>Net Deduction:</span>
                                      <span className="text-red-600">-{formatCurrency(payroll.total_deduction)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        {formatCurrency(payroll.net_payable_salary)}
                      </TableCell>
                      <TableCell>{getStatusBadge(payroll.status)}</TableCell>
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

export default PayrollManager;
