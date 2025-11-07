import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Key } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ResetPasswordDialogProps {
  employeeId: string | null;
  employeeName: string;
  employeeEmail: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ResetPasswordDialog = ({ employeeId, employeeName, employeeEmail, open, onOpenChange }: ResetPasswordDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeId) return;

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/reset-employee-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || "Failed to reset password");
      }

      toast({
        title: "Password reset successfully",
        description: "An email has been sent to the employee with the new credentials.",
      });

      setNewPassword("");
      setConfirmPassword("");
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error resetting password",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword("");
    setConfirmPassword("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            Reset password for <strong>{employeeName}</strong>
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertDescription>
            The employee will receive an email at <strong>{employeeEmail}</strong> with their new password.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password*</Label>
            <div className="flex gap-2">
              <Input
                id="newPassword"
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="outline"
                onClick={generatePassword}
                title="Generate secure password"
              >
                Generate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum 6 characters. Click "Generate" for a secure password.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password*</Label>
            <Input
              id="confirmPassword"
              type="text"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={6}
            />
          </div>

          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <Alert variant="destructive">
              <AlertDescription>Passwords do not match</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || newPassword !== confirmPassword}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
