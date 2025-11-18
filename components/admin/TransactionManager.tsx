import { useState, useEffect } from "react";
import { getDocuments, createDocument, updateDocument, deleteDocument, getDocument } from "@/lib/firebase/firestore";
import { orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, TrendingUp, TrendingDown, Calendar, DollarSign, Trash2, Edit, Download, Filter, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Transaction {
  id: string;
  transaction_date: string;
  transaction_type: "income" | "expense";
  amount: number;
  currency: string;
  client_work_id: string | null;
  project_title?: string;
  category: string;
  notes: string | null;
  created_at: string;
}

interface ClientWork {
  id: string;
  project_name: string;
}

const DEFAULT_EXPENSE_CATEGORIES = [
  "Software Licenses",
  "Salaries",
  "Hardware",
  "Subcontracting",
  "Training",
  "Utilities",
  "Office Expenses",
  "Other"
];

const DEFAULT_INCOME_CATEGORIES = [
  "Project Revenue",
  "Consultation",
  "Maintenance",
  "Training Services",
  "Other"
];

export const TransactionManager = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clientWorks, setClientWorks] = useState<ClientWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Category states
  const [expenseCategories, setExpenseCategories] = useState<string[]>(DEFAULT_EXPENSE_CATEGORIES);
  const [incomeCategories, setIncomeCategories] = useState<string[]>(DEFAULT_INCOME_CATEGORIES);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  // Client states
  const [useManualClient, setUseManualClient] = useState(false);
  const [manualClientName, setManualClientName] = useState("");

  // Form state
  const [transactionDate, setTransactionDate] = useState("");
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [clientWorkId, setClientWorkId] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  // Filter state
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
    fetchClientWorks();
    loadCustomCategories();
  }, []);

  const loadCustomCategories = async () => {
    try {
      const { data: customExpense } = await getDocuments("custom_expense_categories");
      const { data: customIncome } = await getDocuments("custom_income_categories");

      if (customExpense && customExpense.length > 0) {
        const expenseNames = customExpense.map((c: any) => c.name).filter((name: string) => !DEFAULT_EXPENSE_CATEGORIES.includes(name));
        setExpenseCategories([...DEFAULT_EXPENSE_CATEGORIES, ...expenseNames]);
      }

      if (customIncome && customIncome.length > 0) {
        const incomeNames = customIncome.map((c: any) => c.name).filter((name: string) => !DEFAULT_INCOME_CATEGORIES.includes(name));
        setIncomeCategories([...DEFAULT_INCOME_CATEGORIES, ...incomeNames]);
      }
    } catch (error) {
      console.error("Error loading custom categories:", error);
    }
  };

  const addNewCategory = async () => {
    if (!newCategoryInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }

    const currentCategories = transactionType === "income" ? incomeCategories : expenseCategories;
    
    if (currentCategories.includes(newCategoryInput.trim())) {
      toast({
        title: "Error",
        description: "This category already exists",
        variant: "destructive",
      });
      return;
    }

    try {
      const collectionName = transactionType === "income" ? "custom_income_categories" : "custom_expense_categories";
      await createDocument(collectionName, {
        name: newCategoryInput.trim(),
        created_at: new Date().toISOString(),
      });

      if (transactionType === "income") {
        setIncomeCategories([...incomeCategories, newCategoryInput.trim()]);
      } else {
        setExpenseCategories([...expenseCategories, newCategoryInput.trim()]);
      }

      setCategory(newCategoryInput.trim());
      setNewCategoryInput("");
      setShowNewCategory(false);

      toast({
        title: "Success",
        description: `Category "${newCategoryInput.trim()}" added successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await getDocuments("transactions", [
        orderBy("transaction_date", "desc")
      ]);

      if (error) {
        console.log("Transactions feature not yet available:", error);
        setTransactions([]);
        setLoading(false);
        return;
      }

      // Enrich with client work/project titles
      const transactionsWithProjects = await Promise.all(
        (data || []).map(async (transaction: any) => {
          let project_title = null;
          if (transaction.client_work_id) {
            const { data: clientWork } = await getDocument("client_works", transaction.client_work_id);
            project_title = clientWork?.project_name || null;
          }
          return {
            ...transaction,
            project_title
          };
        })
      );

      setTransactions(transactionsWithProjects);
    } catch (error: any) {
      console.log("Transactions feature not yet available:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientWorks = async () => {
    try {
      const { data, error } = await getDocuments("client_works");

      if (!error && data) {
        // Sort by project name
        const sortedWorks = data.sort((a: any, b: any) => 
          (a.project_name || '').localeCompare(b.project_name || '')
        );
        setClientWorks(sortedWorks.map((w: any) => ({ id: w.id, project_name: w.project_name })));
      }
    } catch (error) {
      console.log("Could not fetch client works:", error);
    }
  };

  const resetForm = () => {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setTransactionDate(today);
    setTransactionType("expense");
    setAmount("");
    setClientWorkId("");
    setUseManualClient(false);
    setManualClientName("");
    setCategory("");
    setNotes("");
    setEditingTransaction(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionDate(transaction.transaction_date);
    setTransactionType(transaction.transaction_type);
    setAmount(transaction.amount.toString());
    setClientWorkId(transaction.client_work_id || "");
    setUseManualClient(false);
    setManualClientName("");
    setCategory(transaction.category);
    setNotes(transaction.notes || "");
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    // Detailed validation
    if (!transactionDate) {
      toast({
        title: "Error",
        description: "Please select a transaction date",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (!category) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare notes with manual client name if applicable
      let finalNotes = notes || "";
      if (useManualClient && manualClientName.trim()) {
        finalNotes = `Client: ${manualClientName.trim()}\n${finalNotes}`.trim();
      }

      const transactionData = {
        transaction_date: transactionDate,
        transaction_type: transactionType,
        amount: parseFloat(amount),
        currency: "BDT",
        client_work_id: clientWorkId && clientWorkId !== "none" ? clientWorkId : null,
        category,
        notes: finalNotes || null,
      };

      console.log("Submitting transaction data:", transactionData);

      if (editingTransaction) {
        const { error } = await updateDocument("transactions", editingTransaction.id, {
          ...transactionData,
          updated_at: new Date().toISOString()
        });

        if (error) {
          console.error("Update error:", error);
          throw error;
        }

        toast({
          title: "Success",
          description: "Transaction updated successfully",
        });
      } else {
        const { data, error } = await createDocument("transactions", {
          ...transactionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (error) {
          console.error("Insert error:", error);
          throw error;
        }

        console.log("Transaction created:", data);

        toast({
          title: "Success",
          description: "Transaction added successfully",
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchTransactions();
    } catch (error: any) {
      console.error("Transaction error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save transaction",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    try {
      const { error } = await deleteDocument("transactions", transactionToDelete);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });

      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
      fetchTransactions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Filter transactions based on date range and type
  const getFilteredTransactions = () => {
    return transactions.filter((transaction) => {
      // Filter by type
      if (filterType !== "all" && transaction.transaction_type !== filterType) {
        return false;
      }

      // Filter by date range
      if (filterStartDate && transaction.transaction_date < filterStartDate) {
        return false;
      }
      if (filterEndDate && transaction.transaction_date > filterEndDate) {
        return false;
      }

      return true;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const getTotalIncome = () => {
    return filteredTransactions
      .filter((t) => t.transaction_type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const getTotalExpense = () => {
    return filteredTransactions
      .filter((t) => t.transaction_type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpense();
  };

  const exportToExcel = async () => {
    // Prepare data for Excel
    const excelData = filteredTransactions.map((transaction) => ({
      Date: formatDate(transaction.transaction_date),
      Type: transaction.transaction_type === "income" ? "Income" : "Expense",
      Amount: Number(transaction.amount),
      Currency: transaction.currency,
      Category: transaction.category,
      Project: transaction.project_title || "N/A",
      Notes: transaction.notes || "",
    }));

    // Add summary rows
    excelData.push({} as any); // Empty row
    excelData.push({
      Date: "SUMMARY",
      Type: "",
      Amount: "",
      Currency: "",
      Category: "",
      Project: "",
      Notes: "",
    } as any);
    excelData.push({
      Date: "Total Income",
      Type: "",
      Amount: getTotalIncome(),
      Currency: "BDT",
      Category: "",
      Assignment: "",
      Notes: "",
    } as any);
    excelData.push({
      Date: "Total Expense",
      Type: "",
      Amount: getTotalExpense(),
      Currency: "BDT",
      Category: "",
      Assignment: "",
      Notes: "",
    } as any);
    excelData.push({
      Date: "Net Balance",
      Type: "",
      Amount: getBalance(),
      Currency: "BDT",
      Category: "",
      Assignment: "",
      Notes: "",
    } as any);

    // Dynamically import XLSX only when needed
    const XLSX = await import('xlsx');
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    // Generate filename with date range
    const filename = `Transactions_${filterStartDate || "All"}_to_${filterEndDate || "All"}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);

    toast({
      title: "Success",
      description: "Transactions exported to Excel successfully",
    });
  };

  const categories = transactionType === "income" ? incomeCategories : expenseCategories;

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Transaction Management</h2>
        <p className="text-gray-500">
          Track all income and expenses in Bangladeshi Taka (BDT)
        </p>
      </div>

      <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button onClick={exportToExcel} variant="outline" className="border-blue-600 text-cyan-500 hover:bg-blue-50">
          <Download className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
        <Button onClick={handleOpenDialog} className="bg-cyan-500 hover:bg-cyan-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filter Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Quick Date Range Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                setFilterStartDate(firstDay.toISOString().split('T')[0]);
                setFilterEndDate(today.toISOString().split('T')[0]);
              }}
            >
              This Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
                setFilterStartDate(firstDay.toISOString().split('T')[0]);
                setFilterEndDate(lastDay.toISOString().split('T')[0]);
              }}
            >
              Last Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), 0, 1);
                setFilterStartDate(firstDay.toISOString().split('T')[0]);
                setFilterEndDate(today.toISOString().split('T')[0]);
              }}
            >
              This Year
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const last30Days = new Date(today);
                last30Days.setDate(today.getDate() - 30);
                setFilterStartDate(last30Days.toISOString().split('T')[0]);
                setFilterEndDate(today.toISOString().split('T')[0]);
              }}
            >
              Last 30 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const last90Days = new Date(today);
                last90Days.setDate(today.getDate() - 90);
                setFilterStartDate(last90Days.toISOString().split('T')[0]);
                setFilterEndDate(today.toISOString().split('T')[0]);
              }}
            >
              Last 90 Days
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="filter_start_date">Start Date</Label>
              <Input
                id="filter_start_date"
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filter_end_date">End Date</Label>
              <Input
                id="filter_end_date"
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filter_type">Transaction Type</Label>
              <Select value={filterType} onValueChange={(value: "all" | "income" | "expense") => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="income">Income Only</SelectItem>
                  <SelectItem value="expense">Expense Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilterStartDate("");
                  setFilterEndDate("");
                  setFilterType("all");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(getTotalIncome())}</p>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-red-600">{formatCurrency(getTotalExpense())}</p>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className={`text-2xl font-bold ${getBalance() >= 0 ? "text-cyan-500" : "text-red-600"}`}>
                {formatCurrency(getBalance())}
              </p>
              <DollarSign className="h-8 w-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View and manage all income and expense entries</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {transactions.length === 0 ? "No transactions yet. Add your first transaction!" : "No transactions match the selected filters."}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <Card key={transaction.id} className="border-l-4" style={{
                  borderLeftColor: transaction.transaction_type === "income" ? "#16a34a" : "#dc2626"
                }}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={transaction.transaction_type === "income" ? "default" : "destructive"}>
                            {transaction.transaction_type === "income" ? "Income" : "Expense"}
                          </Badge>
                          <Badge variant="outline">{transaction.category}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(transaction.transaction_date)}
                          </div>
                          {transaction.project_title && (
                            <div className="text-muted-foreground">
                              Project: {transaction.project_title}
                            </div>
                          )}
                          <div className={`font-bold text-lg ${
                            transaction.transaction_type === "income" ? "text-green-600" : "text-red-600"
                          }`}>
                            {transaction.transaction_type === "income" ? "+" : "-"}{formatCurrency(Number(transaction.amount))}
                          </div>
                        </div>
                        {transaction.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Note: {transaction.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTransaction(transaction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setTransactionToDelete(transaction.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Transaction Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTransaction ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
            <DialogDescription>
              Record income or expense entry in Bangladeshi Taka (BDT)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transaction_date">Transaction Date *</Label>
                <Input
                  id="transaction_date"
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="transaction_type">Type *</Label>
                <Select value={transactionType} onValueChange={(value: "income" | "expense") => {
                  setTransactionType(value);
                  setCategory(""); // Reset category when type changes
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount (BDT) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <div className="flex gap-2">
                  <Select value={category || undefined} onValueChange={setCategory} required>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowNewCategory(!showNewCategory)}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                {showNewCategory && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="New category name"
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addNewCategory();
                        }
                      }}
                    />
                    <Button type="button" onClick={addNewCategory} size="sm">Add</Button>
                    <Button type="button" onClick={() => {
                      setShowNewCategory(false);
                      setNewCategoryInput("");
                    }} variant="ghost" size="sm">
                      <X size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientWork">Client Project (Optional)</Label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="useManualClient"
                  checked={useManualClient}
                  onChange={(e) => {
                    setUseManualClient(e.target.checked);
                    if (e.target.checked) {
                      setClientWorkId("");
                    } else {
                      setManualClientName("");
                    }
                  }}
                  className="h-4 w-4"
                />
                <Label htmlFor="useManualClient" className="text-sm font-normal cursor-pointer">
                  Enter client name manually (not linked to project)
                </Label>
              </div>
              
              {useManualClient ? (
                <Input
                  id="manualClientName"
                  placeholder="Enter client name..."
                  value={manualClientName}
                  onChange={(e) => setManualClientName(e.target.value)}
                />
              ) : (
                <Select value={clientWorkId || undefined} onValueChange={(value) => setClientWorkId(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client project (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Project</SelectItem>
                    {clientWorks.map((work) => (
                      <SelectItem key={work.id} value={work.id}>
                        {work.project_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or description..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-cyan-500 hover:bg-cyan-600">
              {editingTransaction ? "Update" : "Add"} Transaction
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the transaction. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
};
