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
import { Download, Check, X, RefreshCw, DollarSign, Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
      const { data, error } = await getDocuments('payroll', [
        where('month', '==', parseInt(selectedMonth)),
        where('year', '==', parseInt(selectedYear))
      ]);

      if (error) throw error;

      // Enrich with employee details
      const enrichedData = await Promise.all(
        (data || []).map(async (payroll: any) => {
          const { data: employee } = await getDocuments('employees', [
            where('id', '==', payroll.employee_id)
          ]);
          
          return {
            ...payroll,
            employee: employee?.[0] || null
          };
        })
      );

      setPayrollData(enrichedData || []);
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
      "Employee ID",
      "Employee Name",
      "Designation",
      "Basic Salary",
      "Present Days",
      "Absent Days",
      "Late Days",
      "Casual Leave",
      "Sick Leave",
      "Unpaid Leave",
      "Late Penalty",
      "Total Deduction",
      "Net Salary",
      "Status"
    ];

    const rows = payrollData.map(p => [
      p.employee?.eid || '-',
      p.employee?.name || '-',
      p.employee?.designation || '-',
      p.basic_salary,
      p.total_present_days,
      p.total_absent_days,
      p.total_late_days,
      p.casual_leave_taken || 0,
      p.sick_leave_taken || 0,
      p.unpaid_leave_days,
      p.late_penalty_days || 0,
      p.total_deduction,
      p.net_payable_salary,
      p.status
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payroll_${selectedYear}_${selectedMonth}.csv`;
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
                Generate and manage monthly salary disbursements based on attendance and leave records
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

            <Button onClick={generatePayroll} disabled={generating}>
              <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Generating...' : 'Generate Payroll'}
            </Button>

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
            <div className="text-center py-8">Loading payroll data...</div>
          ) : payrollData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payroll records found for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}.
              Click "Generate Payroll" to create records.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPayrolls.length === payrollData.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead className="text-right">Basic Salary</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                    <TableHead className="text-center">Late</TableHead>
                    <TableHead className="text-center">Unpaid Leave</TableHead>
                    <TableHead className="text-right">Deduction</TableHead>
                    <TableHead className="text-right">Net Salary</TableHead>
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
                      <TableCell className="text-center">{payroll.total_present_days}</TableCell>
                      <TableCell className="text-center">{payroll.total_absent_days}</TableCell>
                      <TableCell className="text-center">{payroll.total_late_days}</TableCell>
                      <TableCell className="text-center">{payroll.unpaid_leave_days}</TableCell>
                      <TableCell className="text-right text-red-600">
                        -{formatCurrency(payroll.total_deduction)}
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
