import React, { useState } from "react";
import { useAuth } from "../components/auth/auth-provider";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { handleChangePassword } = useAuth();
  const navigate = useNavigate();

  const onChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setMessage("Both current and new passwords are required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      console.log("Attempting to change password...");
      await handleChangePassword(currentPassword, newPassword);
      setMessage("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Password change error:", error);
      setMessage(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="password" className="w-[400px] mx-auto mt-10">
      <TabsList className="grid w-full grid-cols-1">
        <TabsTrigger value="password">Change Password</TabsTrigger>
      </TabsList>

      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change your password here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current Password</Label>
              <Input
                id="current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New Password</Label>
              <Input
                id="new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            {message && (
              <p className={`text-sm mt-2 ${message.includes("Failed") ? "text-red-500" : "text-green-500"}`}>
                {message}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={onChangePassword} disabled={loading} className="w-full">
              {loading ? "Updating..." : "Save Password"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}