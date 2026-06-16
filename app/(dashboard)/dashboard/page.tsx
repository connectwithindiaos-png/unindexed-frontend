"use client";

import { useDeviceStats, useDevices } from "@/hooks/useDevices";
import { useAuthStore } from "@/store/authStore";
import { StatCard } from "@/components/dashboard/stat-card";
import { DeviceTable } from "@/components/tables/device-table";
import { FiTerminal, FiSmartphone, FiEye, FiArrowRight, FiDownload, FiKey, FiImage, FiTrash } from "react-icons/fi";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { BuildLogs } from "@/components/shared/build-logs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userApi } from "@/services/api";

export default function DashboardPage() {
  const role = useAuthStore((s) => s.role);
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading: statsLoading } = useDeviceStats();
  const { data: devicesData, isLoading, error, refetch } = useDevices({ limit: 5, sortBy: "last_seen", sortOrder: "desc" });
  const [showBuildLogs, setShowBuildLogs] = useState(false);
  const [appName, setAppName] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [iconUploading, setIconUploading] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const tokenId = user?.id;
  const iconUrl = tokenId ? `${apiBase.replace('/api', '')}/icons/${tokenId}.png` : null;

  useEffect(() => {
    if (!showBuildLogs || !iconUrl || iconPreview) return;
    fetch(iconUrl, { method: 'HEAD' }).then(r => { if (r.ok) setIconPreview(iconUrl); }).catch(() => {});
  }, [showBuildLogs, iconUrl, iconPreview]);

  const handleIconSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    setIconPreview(base64);
    setIconUploading(true);
    try { await userApi.uploadIcon(base64); } catch {} finally { setIconUploading(false); }
  };

  const handleRemoveIcon = async () => {
    setIconPreview(null);
    try { await userApi.deleteIcon(); } catch {}
    if (iconInputRef.current) iconInputRef.current.value = "";
  };

  const isAdmin = role === "admin";

  const statCards = [
    { title: "total_devices", value: stats?.total ?? 0, icon: <FiTerminal className="h-4 w-4 text-emerald-400" />, description: "All registered devices", loading: statsLoading, accent: "emerald" as const },
    { title: "online", value: stats?.online ?? 0, icon: <FiTerminal className="h-4 w-4 text-cyan-400" />, description: "Currently active", loading: statsLoading, accent: "cyan" as const },
    { title: "offline", value: stats?.offline ?? 0, icon: <FiTerminal className="h-4 w-4 text-amber-400" />, description: "Not responding", loading: statsLoading, accent: "amber" as const },
    { title: "registered_today", value: stats?.registeredToday ?? 0, icon: <FiTerminal className="h-4 w-4 text-violet-400" />, description: "New devices today", loading: statsLoading, accent: "violet" as const },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-600/60 tracking-widest mb-1">
            <FiSmartphone className="h-3 w-3" /> {isAdmin ? "ADMIN" : "USER"} / DASHBOARD
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
            {isAdmin ? "Dashboard" : "My Devices"}
          </h1>
          <p className="text-xs font-mono text-emerald-700 mt-1">
            {isAdmin ? "Full system overview" : "Devices linked to your access token"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-all">
              <FiEye className="h-3.5 w-3.5" /> admin_panel <FiArrowRight className="h-3 w-3" />
            </Link>
          )}
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            live
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* User-specific section: Token info + APK build */}
      {!isAdmin && (
        <div className="space-y-3">
          {/* Session info */}
          <div className="rounded-xl border border-emerald-900/30 bg-black/60 p-5 box-glow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-950/30">
                  <FiTerminal className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-mono text-emerald-400">$ session_active</p>
                  <p className="text-[10px] font-mono text-emerald-700 mt-0.5">
                    Token authenticated — monitoring {stats?.total ?? 0} device(s). Data refreshes every 5s.
                  </p>
                </div>
              </div>
              {!showBuildLogs && (
                <button
                  onClick={() => setShowBuildLogs(true)}
                  className="inline-flex items-center gap-2 text-xs font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-4 py-2 rounded-lg transition-all shrink-0"
                >
                  <FiDownload className="h-3.5 w-3.5" /> build_apk
                </button>
              )}
            </div>
          </div>

          {/* APK configuration panel */}
          {showBuildLogs && !confirmed && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-5 animate-slide-up box-glow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FiKey className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-mono text-emerald-300">// APK Configuration</span>
              </div>

              {/* Icon upload */}
              <div className="mb-4">
                <label className="text-[10px] font-mono text-emerald-600/80 mb-1.5 block tracking-wider">LAUNCHER_ICON</label>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl border border-emerald-900/30 bg-black/60 flex items-center justify-center overflow-hidden shrink-0">
                    {iconPreview ? (
                      <img src={iconPreview} alt="icon" className="h-full w-full object-cover" />
                    ) : (
                      <FiImage className="h-5 w-5 text-emerald-700" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <input
                      ref={iconInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleIconSelect}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => iconInputRef.current?.click()}
                        disabled={iconUploading}
                        className="text-[10px] font-mono border border-emerald-900/30 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-950/30 px-2.5 py-1.5 rounded transition-all disabled:opacity-50"
                      >
                        {iconUploading ? "uploading..." : "choose_icon"}
                      </button>
                      {iconPreview && (
                        <button
                          onClick={handleRemoveIcon}
                          className="text-[10px] font-mono border border-red-900/30 text-red-500 hover:text-red-400 hover:bg-red-950/30 px-2.5 py-1.5 rounded transition-all"
                        >
                          <FiTrash className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-emerald-800">PNG/JPEG recommended, 512x512+</p>
                  </div>
                </div>
              </div>

              {/* App name */}
              <div className="mb-4">
                <label className="text-[10px] font-mono text-emerald-600/80 mb-1.5 block tracking-wider">APPLICATION_NAME</label>
                <Input
                  placeholder="e.g. My Device Manager"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="bg-black/50 border-emerald-900/40 text-emerald-300 placeholder:text-emerald-800 h-10 text-sm font-mono focus-visible:ring-emerald-500/30"
                  autoFocus
                />
                <p className="text-[10px] font-mono text-emerald-800 mt-1">This name will appear on the device after APK installation</p>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setConfirmed(true)}
                  disabled={!appName.trim()}
                  className="font-mono text-xs h-10 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                >
                  $ generate_apk
                </Button>
              </div>
            </div>
          )}

          {/* Build logs */}
          {showBuildLogs && confirmed && (
            <BuildLogs
              sseUrl={`${apiBase}/user/apk/logs?name=${encodeURIComponent(appName.trim())}`}
              downloadUrl={`${apiBase}/user/apk?name=${encodeURIComponent(appName.trim())}`}
              filename={`${appName.trim()}.apk`}
              onClose={() => { setShowBuildLogs(false); setAppName(""); setConfirmed(false); }}
            />
          )}
        </div>
      )}

      {/* Admin-specific: quick links */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/admin/tokens" className="group rounded-xl border border-emerald-900/30 bg-black/60 p-4 hover:border-emerald-500/30 transition-all box-glow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-950/30 group-hover:bg-emerald-900/30 transition-colors">
                <FiTerminal className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-mono text-emerald-400">$ manage_tokens</p>
                <p className="text-[10px] font-mono text-emerald-700 mt-0.5">Create and manage deployment tokens</p>
              </div>
              <FiArrowRight className="h-4 w-4 text-emerald-700 ml-auto group-hover:text-emerald-400 transition-colors" />
            </div>
          </Link>
          <div className="rounded-xl border border-emerald-900/30 bg-black/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-950/30">
                <FiTerminal className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs font-mono text-cyan-400">$ system_online</p>
                <p className="text-[10px] font-mono text-cyan-700/60 mt-0.5">
                  {stats?.online ?? 0} of {stats?.total ?? 0} devices active
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Devices */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-mono text-emerald-400">// Recent Devices</h2>
            <p className="text-[10px] font-mono text-emerald-700">Latest device activity</p>
          </div>
          <Link href="/devices" className="text-[10px] font-mono text-emerald-500 hover:text-emerald-400 transition-colors">
            view_all &rarr;
          </Link>
        </div>
        <DeviceTable devices={devicesData?.devices ?? []} loading={isLoading} error={error} onRetry={() => refetch()} role={role} />
      </div>
    </div>
  );
}
