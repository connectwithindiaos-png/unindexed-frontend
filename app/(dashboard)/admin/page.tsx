"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useAdminStats } from "@/hooks/useAdmin";
import { useDeviceStats, useDevices } from "@/hooks/useDevices";
import { StatCard } from "@/components/dashboard/stat-card";
import { DeviceTable } from "@/components/tables/device-table";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { FiTerminal, FiKey, FiShield, FiArrowRight } from "react-icons/fi";

export default function AdminDashboardPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);

  useEffect(() => {
    if (role === "user") router.push("/dashboard");
  }, [role, router]);

  const { data: adminStats, isLoading: adminStatsLoading } = useAdminStats();
  const { data: stats, isLoading: statsLoading } = useDeviceStats();
  const { data: devicesData, isLoading, error, refetch } = useDevices({ limit: 5, sortBy: "last_seen", sortOrder: "desc" });

  if (role === "user" || role === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    { title: "total_devices", value: stats?.total ?? 0, icon: <FiTerminal className="h-4 w-4 text-emerald-400" />, description: "All registered devices", loading: statsLoading, accent: "emerald" as const },
    { title: "online", value: stats?.online ?? 0, icon: <FiTerminal className="h-4 w-4 text-cyan-400" />, description: "Currently active", loading: statsLoading, accent: "cyan" as const },
    { title: "offline", value: stats?.offline ?? 0, icon: <FiTerminal className="h-4 w-4 text-amber-400" />, description: "Not responding", loading: statsLoading, accent: "amber" as const },
    { title: "total_tokens", value: adminStats?.totalTokens ?? 0, icon: <FiTerminal className="h-4 w-4 text-violet-400" />, description: `${adminStats?.activeTokens ?? 0} active`, loading: adminStatsLoading, accent: "violet" as const },
    { title: "assigned_devices", value: adminStats?.assignedDevices ?? 0, icon: <FiTerminal className="h-4 w-4 text-emerald-400" />, description: "Devices linked to tokens", loading: adminStatsLoading, accent: "emerald" as const },
    { title: "registered_today", value: stats?.registeredToday ?? 0, icon: <FiTerminal className="h-4 w-4 text-cyan-400" />, description: "New devices today", loading: statsLoading, accent: "cyan" as const },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-600/60 tracking-widest mb-1">
            <FiShield className="h-3 w-3" /> ADMIN / DASHBOARD
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">Admin Console</h1>
          <p className="text-xs font-mono text-emerald-700 mt-1">Global system overview — tokens, devices, and status</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/tokens" className="inline-flex items-center gap-2 text-xs font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-4 py-2 rounded-lg transition-all">
            <FiKey className="h-3.5 w-3.5" /> manage_tokens <FiArrowRight className="h-3 w-3" />
          </Link>
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            live
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/admin/tokens" className="group rounded-xl border border-emerald-900/30 bg-black/60 p-4 hover:border-emerald-500/30 transition-all box-glow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-950/30 group-hover:bg-emerald-900/30 transition-colors">
              <FiKey className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-mono text-emerald-400">$ create_token</p>
              <p className="text-[10px] font-mono text-emerald-700 mt-0.5">Generate new deployment tokens</p>
            </div>
            <FiArrowRight className="h-4 w-4 text-emerald-700 ml-auto group-hover:text-emerald-400 transition-colors" />
          </div>
        </Link>
        <Link href="/devices" className="group rounded-xl border border-emerald-900/30 bg-black/60 p-4 hover:border-emerald-500/30 transition-all box-glow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-950/30 group-hover:bg-cyan-900/30 transition-colors">
              <FiTerminal className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs font-mono text-cyan-400">$ view_devices</p>
              <p className="text-[10px] font-mono text-cyan-700/60 mt-0.5">Monitor all connected devices</p>
            </div>
            <FiArrowRight className="h-4 w-4 text-cyan-700 ml-auto group-hover:text-cyan-400 transition-colors" />
          </div>
        </Link>
        <div className="rounded-xl border border-emerald-900/30 bg-black/60 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-950/30">
              <FiTerminal className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <p className="text-xs font-mono text-violet-400">$ system_status</p>
              <p className="text-[10px] font-mono text-violet-700/60 mt-0.5">
                {adminStats?.activeTokens ?? 0}/{adminStats?.totalTokens ?? 0} tokens active
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Devices */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-mono text-emerald-400">// Recent Devices</h2>
            <p className="text-[10px] font-mono text-emerald-700">Latest device activity across all tokens</p>
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
