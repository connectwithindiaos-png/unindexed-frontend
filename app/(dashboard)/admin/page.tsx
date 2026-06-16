"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAdminStats } from "@/hooks/useAdmin";
import { useDeviceStats, useDevices } from "@/hooks/useDevices";
import { StatCard } from "@/components/dashboard/stat-card";
import { DeviceTable } from "@/components/tables/device-table";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { FiSmartphone, FiWifi, FiXCircle, FiKey, FiUsers, FiCalendar } from "react-icons/fi";

export default function AdminDashboardPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);

  useEffect(() => {
    if (role === "user") router.push("/dashboard");
  }, [role, router]);

  const { data: adminStats, isLoading: adminStatsLoading } = useAdminStats();
  const { data: stats, isLoading: statsLoading } = useDeviceStats();
  const { data: devicesData, isLoading, error, refetch } = useDevices({
    limit: 5,
    sortBy: "last_seen",
    sortOrder: "desc",
  });

  if (role === "user" || role === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Devices",
      value: stats?.total ?? 0,
      icon: <FiSmartphone className="h-5 w-5 text-primary" />,
      description: "All registered devices",
      loading: statsLoading,
    },
    {
      title: "Online",
      value: stats?.online ?? 0,
      icon: <FiWifi className="h-5 w-5 text-emerald-500" />,
      description: "Currently active",
      loading: statsLoading,
    },
    {
      title: "Offline",
      value: stats?.offline ?? 0,
      icon: <FiXCircle className="h-5 w-5 text-red-500" />,
      description: "Not responding",
      loading: statsLoading,
    },
    {
      title: "Total Tokens",
      value: adminStats?.totalTokens ?? 0,
      icon: <FiKey className="h-5 w-5 text-violet-500" />,
      description: `${adminStats?.activeTokens ?? 0} active`,
      loading: adminStatsLoading,
    },
    {
      title: "Assigned Devices",
      value: adminStats?.assignedDevices ?? 0,
      icon: <FiUsers className="h-5 w-5 text-blue-500" />,
      description: "Devices linked to tokens",
      loading: adminStatsLoading,
    },
    {
      title: "Registered Today",
      value: stats?.registeredToday ?? 0,
      icon: <FiCalendar className="h-5 w-5 text-amber-500" />,
      description: "New devices today",
      loading: statsLoading,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Global overview of all tokens and devices
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          Auto-refreshing
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Recent Devices</h2>
            <p className="text-sm text-muted-foreground">Latest device activity across all tokens</p>
          </div>
          <a
            href="/devices"
            className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
          >
            View all &rarr;
          </a>
        </div>
        <DeviceTable
          devices={devicesData?.devices ?? []}
          loading={isLoading}
          error={error}
          onRetry={() => refetch()}
          role={role}
        />
      </div>
    </div>
  );
}
