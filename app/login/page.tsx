"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLogin, useRequireAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { FiSmartphone, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { isAuthenticated } = useRequireAuth();
  const loginMutation = useLogin();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-secondary">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md px-4">
        <div className="rounded-2xl border bg-card/80 backdrop-blur-xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg mb-4">
              <FiSmartphone className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Device Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to your admin account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {loginMutation.isError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <FiAlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  {loginMutation.error instanceof Error
                    ? loginMutation.error.message
                    : "Login failed. Please try again."}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
<FiEyeOff className="h-4 w-4" />
                    ) : (
                    <FiEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="remember"
                  checked={remember}
                  onCheckedChange={setRemember}
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  Remember me
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Device Management System v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
