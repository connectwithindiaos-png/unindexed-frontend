"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLogin, useTokenLogin, useRequireAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { FiEye, FiEyeOff, FiAlertCircle, FiKey, FiTerminal } from "react-icons/fi";
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
    if (isAuthenticated) { router.push("/dashboard"); }
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-20" />
      <div className="absolute inset-0 bg-scanline pointer-events-none opacity-30" />

      <div className="relative w-full max-w-md px-4">
        <div className="rounded-xl border border-emerald-500/20 bg-black/90 backdrop-blur shadow-[0_0_40px_rgba(52,211,153,0.05)] p-8">
          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/30 mb-4 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
              <FiTerminal className="h-7 w-7 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold font-mono text-emerald-400 tracking-wider">// PANEL</h1>
            <p className="text-xs font-mono text-emerald-700 mt-2">
              {mode === "admin" ? "admin authentication required" : "enter access token"}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex rounded-lg border border-emerald-900/30 p-1 mb-6 bg-black/60">
            <button onClick={() => setMode("admin")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-mono transition-all",
                mode === "admin" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "text-emerald-700 hover:text-emerald-500 border border-transparent"
              )}
            >
              <FiTerminal className="h-3.5 w-3.5" /> admin
            </button>
            <button onClick={() => setMode("token")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-mono transition-all",
                mode === "token" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "text-emerald-700 hover:text-emerald-500 border border-transparent"
              )}
            >
              <FiKey className="h-3.5 w-3.5" /> token
            </button>
          </div>

          {/* Admin Login Form */}
          {mode === "admin" ? (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              {loginMutation.isError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-900/30 bg-red-950/20 p-3">
                  <FiAlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span className="text-xs font-mono text-red-400">
                    {loginMutation.error instanceof Error ? loginMutation.error.message : "Login failed"}
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-emerald-700 tracking-wider uppercase">Email</label>
                <Input type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" autoFocus
                  className="h-10 bg-black/60 border-emerald-900/40 text-emerald-300 placeholder:text-emerald-800 text-sm font-mono focus-visible:ring-emerald-500/30" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-emerald-700 tracking-wider uppercase">Password</label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
                    className="h-10 pr-10 bg-black/60 border-emerald-900/40 text-emerald-300 placeholder:text-emerald-800 text-sm font-mono focus-visible:ring-emerald-500/30" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-700 hover:text-emerald-400">
                    {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch id="remember" checked={remember} onCheckedChange={setRemember}
                  className="data-[state=checked]:bg-emerald-500" />
                <label htmlFor="remember" className="text-[10px] font-mono text-emerald-600 cursor-pointer">remember_session</label>
              </div>

              <Button type="submit" disabled={loginMutation.isPending}
                className="w-full h-10 text-xs font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]">
                {loginMutation.isPending ? "authenticating..." : "$ login --admin"}
              </Button>
            </form>
          ) : (
            /* Token Login Form */
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              {tokenLoginMutation.isError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-900/30 bg-red-950/20 p-3">
                  <FiAlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span className="text-xs font-mono text-red-400">
                    {tokenLoginMutation.error instanceof Error ? tokenLoginMutation.error.message : "Invalid token"}
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-emerald-700 tracking-wider uppercase">Access Token</label>
                <Input placeholder="paste_token_here" value={token} onChange={(e) => setToken(e.target.value)} required autoFocus
                  className="h-10 bg-black/60 border-emerald-900/40 text-emerald-300 placeholder:text-emerald-800 text-sm font-mono tracking-wider focus-visible:ring-emerald-500/30" />
              </div>

              <Button type="submit" disabled={tokenLoginMutation.isPending}
                className="w-full h-10 text-xs font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]">
                {tokenLoginMutation.isPending ? "verifying..." : "$ login --token"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-[10px] font-mono text-emerald-800">
            // PANEL v3.2.1 — device monitoring system
          </p>
        </div>
      </div>
    </div>
  );
}
