"use client";

import { useDeviceStats, useDevices } from "@/hooks/useDevices";
import { StatCard } from "@/components/dashboard/stat-card";
import { DeviceTable } from "@/components/tables/device-table";
import { FiSmartphone, FiWifi, FiXCircle, FiCalendar } from "react-icons/fi";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDeviceStats();
  const { data: devicesData, isLoading, error, refetch } = useDevices({
    limit: 5,
    sortBy: "last_seen",
    sortOrder: "desc",
  });

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
      title: "Registered Today",
      value: stats?.registeredToday ?? 0,
      icon: <FiCalendar className="h-5 w-5 text-blue-500" />,
      description: "New devices today",
      loading: statsLoading,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your device ecosystem
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Recent Devices</h2>
            <p className="text-sm text-muted-foreground">
              Latest device activity
            </p>
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
        />
      </div>
    </div>
  );
}
