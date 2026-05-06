"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/dashboard/layout";
import Header from "@/components/dashboard/header";
import { useAuth } from "@/context/auth";
import { usersApi, type User } from "@/lib/api";
import { Loader2 } from "lucide-react";

const DEPARTMENTS = ["IT", "Electrical", "Maintenance", "Cleaning", "General"];

export default function Settings() {
  const { user, updateUser } = useAuth();

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl space-y-6">
        <Header
          title="Settings"
          description="Manage your profile, notifications, and workspace preferences."
        />

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6 space-y-6">
            <ProfileCard user={user} onUpdate={updateUser} />
            <PasswordCard />
          </TabsContent>

          <TabsContent value="appearance" className="mt-6">
            <AppearanceCard />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// ----------------------------------------------------------------------------
// Profile Card
// ----------------------------------------------------------------------------
function ProfileCard({ user, onUpdate }: { user: User | null; onUpdate: (user: User) => void }) {
  const [name, setName] = useState(user?.name || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setLoading(true);
    const res = await usersApi.update({ name: name.trim(), department: department || undefined });
    if (res.success && res.data) {
      onUpdate(res.data.user);
      toast.success("Profile updated successfully");
    } else {
      toast.error(res.error || "Failed to update profile");
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Profile</CardTitle>
        <CardDescription className="text-xs">
          Update your personal information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-lg font-semibold text-primary-foreground">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user.email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dept">Department</Label>
            {user.role !== "user" ? (
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={department || "—"} disabled />
            )}
            <p className="text-[10px] text-muted-foreground">
              {user.role === "user"
                ? "Department is assigned by admin."
                : "Staff members are responsible for this department."}
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Save changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------------
// Password Card
// ----------------------------------------------------------------------------
function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const res = await usersApi.changePassword(currentPassword, newPassword);
    if (res.success) {
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(res.error || "Failed to change password");
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Password</CardTitle>
        <CardDescription className="text-xs">
          Change your password to keep your account secure.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="current">Current password</Label>
            <Input
              id="current"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">New password</Label>
            <Input
              id="new"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input
            id="confirm"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={handleChangePassword} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Update password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------------
// Appearance Card (dark mode toggle works)
// ----------------------------------------------------------------------------
function AppearanceCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Appearance</CardTitle>
        <CardDescription className="text-xs">
          Customize how SCRRS looks on your device.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Dark mode</p>
            <p className="text-xs text-muted-foreground">
              Use a darker theme across the app.
            </p>
          </div>
          <Switch
            defaultChecked={document.documentElement.classList.contains("dark")}
            onCheckedChange={(v) => {
              document.documentElement.classList.toggle("dark", v);
              toast.success(v ? "Dark mode on" : "Light mode on");
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}