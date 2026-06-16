"use client";

import { useDeviceStats, useDevices } from "@/hooks/useDevices";
import { useAuthStore } from "@/store/authStore";
import { StatCard } from "@/components/dashboard/stat-card";
import { DeviceTable } from "@/components/tables/device-table";
import { FiTerminal, FiSmartphone, FiEye, FiArrowRight, FiDownload, FiLoader } from "react-icons/fi";
import Link from "next/link";
import { downloadApk } from "@/services/api";
import { useState } from "react";

export default function DashboardPage() {
  const role = useAuthStore((s) => s.role);
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading: statsLoading } = useDeviceStats();
  const { data: devicesData, isLoading, error, refetch } = useDevices({ limit: 5, sortBy: "last_seen", sortOrder: "desc" });
  const [downloading, setDownloading] = useState(false);

  const handleDownloadApk = async () => {
    setDownloading(true);
    try {
      await downloadApk(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/user/apk`,
        "panel-client.apk"
      );
    } catch {
      // silent
    } finally {
      setDownloading(false);
    }
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

      {/* User-specific section: Token info + APK download */}
      {!isAdmin && (
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
            <button
              onClick={handleDownloadApk}
              disabled={downloading}
              className="inline-flex items-center gap-2 text-xs font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-4 py-2 rounded-lg transition-all shrink-0 disabled:opacity-50"
            >
              {downloading ? <FiLoader className="h-3.5 w-3.5 animate-spin" /> : <FiDownload className="h-3.5 w-3.5" />} {downloading ? "downloading..." : "download_apk"}
            </button>
          </div>
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
