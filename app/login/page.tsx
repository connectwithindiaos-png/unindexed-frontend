"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLogin, useTokenLogin, useRequireAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { FiSmartphone, FiEye, FiEyeOff, FiAlertCircle, FiKey, FiMail } from "react-icons/fi";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [mode, setMode] = useState<"admin" | "token">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { isAuthenticated, role } = useRequireAuth();
  const loginMutation = useLogin();
  const tokenLoginMutation = useTokenLogin();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    loginMutation.mutate({ email, password });
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    tokenLoginMutation.mutate({ token });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-secondary">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md px-4">
        <div className="rounded-2xl border bg-card/80 backdrop-blur-xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg mb-4">
              <FiSmartphone className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">DevicePanel</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "admin" ? "Admin sign in" : "Enter your access token"}
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="flex rounded-xl border border-border p-1 mb-6 bg-muted/50">
            <button
              onClick={() => setMode("admin")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                mode === "admin" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FiMail className="h-4 w-4" />
              Admin
            </button>
            <button
              onClick={() => setMode("token")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                mode === "token" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FiKey className="h-4 w-4" />
              Token
            </button>
          </div>

          {mode === "admin" ? (
            <form onSubmit={handleAdminSubmit} className="space-y-5">
              {loginMutation.isError && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <FiAlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    {loginMutation.error instanceof Error
                      ? loginMutation.error.message
                      : "Login failed"}
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
                    {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch id="remember" checked={remember} onCheckedChange={setRemember} />
                  <Label htmlFor="remember" className="text-sm cursor-pointer">Remember me</Label>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-base" disabled={loginMutation.isPending}>
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
          ) : (
            <form onSubmit={handleTokenSubmit} className="space-y-5">
              {tokenLoginMutation.isError && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <FiAlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    {tokenLoginMutation.error instanceof Error
                      ? tokenLoginMutation.error.message
                      : "Invalid token"}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="token">Access Token</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Paste your access token here"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  autoFocus
                  className="h-11 font-mono text-sm"
                />
              </div>

              <Button type="submit" className="w-full h-11 text-base" disabled={tokenLoginMutation.isPending}>
                {tokenLoginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Verifying token...
                  </span>
                ) : (
                  "Access Dashboard"
                )}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            DevicePanel v2.0 &mdash; Token-Based Access
          </p>
        </div>
      </div>
    </div>
  );
}
