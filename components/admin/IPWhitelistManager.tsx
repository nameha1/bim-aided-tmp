import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// TODO: Migrate to Firebase
import { supabase } from "@/lib/supabase-stub";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { 
  Globe, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  MapPin,
  RefreshCw,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface IpWhitelist {
  id: string;
  ip_address: string;
  location_name: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

const IPWhitelistManager = () => {
  const [ipList, setIpList] = useState<IpWhitelist[]>([]);
  const [currentIp, setCurrentIp] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedIp, setSelectedIp] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    ip_address: "",
    location_name: "",
    description: "",
  });

  useEffect(() => {
    fetchIpList();
    fetchCurrentIp();
  }, []);

  const fetchCurrentIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setCurrentIp(data.ip);
    } catch (error) {
      console.error("Error fetching current IP:", error);
      toast({
        title: "Error",
        description: "Failed to fetch current IP address",
        variant: "destructive",
      });
    }
  };

  const fetchIpList = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ip_whitelist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIpList(data || []);
    } catch (error: any) {
      console.error("Error fetching IP list:", error);
      toast({
        title: "Error",
        description: "Failed to load IP whitelist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFillCurrentIp = () => {
    if (currentIp) {
      setFormData({
        ...formData,
        ip_address: currentIp,
      });
      toast({
        title: "IP Auto-filled",
        description: `Current IP address (${currentIp}) has been filled in the form`,
      });
    }
  };

  const handleAddIp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("ip_whitelist").insert({
        ip_address: formData.ip_address,
        location_name: formData.location_name || null,
        description: formData.description || null,
        added_by: userData.user?.id,
        is_active: true,
      });

      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new Error("This IP address is already in the whitelist");
        }
        throw error;
      }

      toast({
        title: "IP Added",
        description: "IP address has been added to the whitelist",
      });

      setFormData({
        ip_address: "",
        location_name: "",
        description: "",
      });
      setDialogOpen(false);
      fetchIpList();
    } catch (error: any) {
      console.error("Error adding IP:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add IP address",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("ip_whitelist")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: currentStatus ? "IP Deactivated" : "IP Activated",
        description: `IP address has been ${currentStatus ? "deactivated" : "activated"}`,
      });

      fetchIpList();
    } catch (error: any) {
      console.error("Error toggling IP status:", error);
      toast({
        title: "Error",
        description: "Failed to update IP status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteIp = async () => {
    if (!selectedIp) return;

    try {
      const { error } = await supabase
        .from("ip_whitelist")
        .delete()
        .eq("id", selectedIp);

      if (error) throw error;

      toast({
        title: "IP Deleted",
        description: "IP address has been removed from the whitelist",
      });

      setDeleteDialogOpen(false);
      setSelectedIp(null);
      fetchIpList();
    } catch (error: any) {
      console.error("Error deleting IP:", error);
      toast({
        title: "Error",
        description: "Failed to delete IP address",
        variant: "destructive",
      });
    }
  };

  const isCurrentIpWhitelisted = ipList.some(
    (ip) => ip.ip_address === currentIp && ip.is_active
  );

  return (
    <div className="space-y-6">
      {/* Current IP Status Card */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="text-primary" size={24} />
            Current Network Status
          </CardTitle>
          <CardDescription>
            Your current IP address and whitelist status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Your Current IP Address</p>
              <p className="text-lg font-mono font-semibold">{currentIp || "Loading..."}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCurrentIp}
              disabled={loading}
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
          </div>

          <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
            isCurrentIpWhitelisted 
              ? "bg-green-50 dark:bg-green-950/20 border-green-500" 
              : "bg-orange-50 dark:bg-orange-950/20 border-orange-500"
          }`}>
            <div className="flex items-center gap-3">
              {isCurrentIpWhitelisted ? (
                <CheckCircle2 className="text-green-600" size={24} />
              ) : (
                <XCircle className="text-orange-600" size={24} />
              )}
              <div>
                <p className="font-semibold">
                  {isCurrentIpWhitelisted ? "Whitelisted" : "Not Whitelisted"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isCurrentIpWhitelisted 
                    ? "Employees can check in from this network" 
                    : "This IP is not authorized for attendance check-in"}
                </p>
              </div>
            </div>
            {!isCurrentIpWhitelisted && (
              <Button
                onClick={() => {
                  handleAutoFillCurrentIp();
                  setDialogOpen(true);
                }}
                size="sm"
              >
                <Plus size={16} className="mr-2" />
                Add This IP
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* IP Whitelist Table */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>IP Whitelist</CardTitle>
              <CardDescription>
                Manage authorized IP addresses for attendance check-in
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  Add IP Address
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add IP to Whitelist</DialogTitle>
                  <DialogDescription>
                    Add a new IP address to allow attendance check-in
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddIp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ip_address">IP Address *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="ip_address"
                        placeholder="e.g., 192.168.1.1"
                        value={formData.ip_address}
                        onChange={(e) =>
                          setFormData({ ...formData, ip_address: e.target.value })
                        }
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAutoFillCurrentIp}
                        disabled={!currentIp}
                      >
                        Use Current
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location_name">Location Name</Label>
                    <Input
                      id="location_name"
                      placeholder="e.g., Main Office, Branch Office"
                      value={formData.location_name}
                      onChange={(e) =>
                        setFormData({ ...formData, location_name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Optional notes about this IP address"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      Add IP Address
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading && ipList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading IP whitelist...
            </div>
          ) : ipList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No IP addresses in whitelist. Add your first IP to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ipList.map((ip) => (
                  <TableRow key={ip.id}>
                    <TableCell className="font-mono font-semibold">
                      {ip.ip_address}
                      {ip.ip_address === currentIp && (
                        <Badge variant="outline" className="ml-2">Current</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-muted-foreground" />
                        {ip.location_name || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {ip.description || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ip.is_active ? "default" : "secondary"}>
                        {ip.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(ip.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(ip.id, ip.is_active)}
                        >
                          {ip.is_active ? (
                            <ToggleRight size={18} className="text-green-600" />
                          ) : (
                            <ToggleLeft size={18} className="text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedIp(ip.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 size={18} className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete IP Address?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this IP address from the whitelist.
              Employees will not be able to check in from this network anymore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteIp}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IPWhitelistManager;
