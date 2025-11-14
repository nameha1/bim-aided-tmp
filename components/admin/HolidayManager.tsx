"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'government' | 'weekend' | 'company';
  description?: string;
}

const HolidayManager = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  const [newHoliday, setNewHoliday] = useState({
    name: "",
    date: "",
    type: "government" as 'government' | 'weekend' | 'company',
    description: "",
  });

  useEffect(() => {
    fetchHolidays();
  }, [selectedYear]);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/holidays?year=${selectedYear}`);
      const result = await response.json();

      if (response.ok) {
        setHolidays(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch holidays');
      }
    } catch (error: any) {
      console.error("Error fetching holidays:", error);
      toast({
        title: "Error loading holidays",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = async () => {
    if (!newHoliday.name || !newHoliday.date) {
      toast({
        title: "Validation Error",
        description: "Please provide holiday name and date",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHoliday),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Holiday added successfully",
        });
        setNewHoliday({
          name: "",
          date: "",
          type: "government",
          description: "",
        });
        fetchHolidays();
      } else {
        throw new Error(result.message || 'Failed to add holiday');
      }
    } catch (error: any) {
      console.error("Error adding holiday:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!confirm("Are you sure you want to delete this holiday?")) {
      return;
    }

    try {
      const response = await fetch('/api/holidays', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Holiday deleted successfully",
        });
        fetchHolidays();
      } else {
        throw new Error(result.message || 'Failed to delete holiday');
      }
    } catch (error: any) {
      console.error("Error deleting holiday:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      weekend: 'bg-blue-100 text-blue-800 border-blue-300',
      government: 'bg-green-100 text-green-800 border-green-300',
      company: 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return (
      <Badge variant="outline" className={colors[type] || 'bg-gray-100 text-gray-800'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
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
          Configure holidays that will be excluded from working days calculations. 
          Fridays are automatically considered off days. Holidays impact salary calculations 
          and attendance tracking.
        </AlertDescription>
      </Alert>

      {/* Year Selector and Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Label>Year:</Label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          Total holidays: <span className="font-semibold text-foreground">{holidays.length}</span>
        </div>
      </div>

      {/* Add New Holiday */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Holiday
          </CardTitle>
          <CardDescription>
            Define holidays for accurate working days calculation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="holiday-name">Holiday Name *</Label>
              <Input
                id="holiday-name"
                placeholder="e.g., New Year's Day"
                value={newHoliday.name}
                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="holiday-date">Date *</Label>
              <Input
                id="holiday-date"
                type="date"
                value={newHoliday.date}
                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="holiday-type">Type *</Label>
              <Select
                value={newHoliday.type}
                onValueChange={(value: 'government' | 'weekend' | 'company') => 
                  setNewHoliday({ ...newHoliday, type: value })
                }
              >
                <SelectTrigger id="holiday-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="government">Government Holiday</SelectItem>
                  <SelectItem value="weekend">Weekend (Friday)</SelectItem>
                  <SelectItem value="company">Company Holiday</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="holiday-description">Description (Optional)</Label>
              <Input
                id="holiday-description"
                placeholder="Additional details about this holiday"
                value={newHoliday.description}
                onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <Button onClick={handleAddHoliday} disabled={saving} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                {saving ? "Adding..." : "Add Holiday"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holidays List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Holidays for {selectedYear}
          </CardTitle>
          <CardDescription>
            All configured holidays for the selected year
          </CardDescription>
        </CardHeader>
        <CardContent>
          {holidays.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No holidays configured for {selectedYear}. Add holidays above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Holiday Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell className="font-medium">
                        {new Date(holiday.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="font-medium">{holiday.name}</TableCell>
                      <TableCell>{getTypeBadge(holiday.type)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {holiday.description || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteHoliday(holiday.id)}
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
};

export default HolidayManager;
