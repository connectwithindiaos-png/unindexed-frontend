"use client";

import { useState } from "react";
import Link from "next/link";
import type { Device } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { formatDate, timeAgo } from "@/lib/utils";
import { FiSmartphone, FiTrash2, FiEye, FiChevronRight, FiTerminal } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface DeviceTableProps {
  devices: Device[];
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
  role?: string | null;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-emerald-900/20">
      <div className="shimmer h-8 w-8 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <div className="shimmer h-4 w-40 rounded" />
        <div className="shimmer h-3 w-24 rounded" />
      </div>
      <div className="hidden md:block shimmer h-5 w-16 rounded-full" />
      <div className="hidden lg:block shimmer h-5 w-20 rounded" />
      <div className="hidden sm:block shimmer h-5 w-16 rounded-full" />
      <div className="hidden xl:block shimmer h-4 w-24 rounded" />
    </div>
  );
}

export function DeviceTable({ devices, loading, error, onRetry, onDelete, isDeleting, role }: DeviceTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewDetails, setViewDetails] = useState<string | null>(null);

  if (error) {
    return <ErrorState title="Failed to load devices" message={error.message} onRetry={onRetry} />;
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-emerald-900/30 bg-black/60 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <EmptyState
        icon={<FiTerminal className="h-6 w-6 text-emerald-600" />}
        title="No devices found"
        description="No devices have been registered yet. Devices will appear here once they connect."
      />
    );
  }

  return (
    <div className="rounded-xl border border-emerald-900/30 bg-black/60 overflow-hidden box-glow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-emerald-900/20 bg-emerald-950/20">
              <th className="px-4 py-3 text-left text-[10px] font-mono text-emerald-600 uppercase tracking-widest">Device</th>
              <th className="px-4 py-3 text-left text-[10px] font-mono text-emerald-600 uppercase tracking-widest hidden md:table-cell">Android</th>
              <th className="px-4 py-3 text-left text-[10px] font-mono text-emerald-600 uppercase tracking-widest hidden lg:table-cell">App</th>
              <th className="px-4 py-3 text-left text-[10px] font-mono text-emerald-600 uppercase tracking-widest hidden sm:table-cell">Status</th>
              <th className="px-4 py-3 text-left text-[10px] font-mono text-emerald-600 uppercase tracking-widest hidden xl:table-cell">Last Seen</th>
              <th className="px-4 py-3 text-right text-[10px] font-mono text-emerald-600 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-900/10">
            {devices.map((device) => (
              <tr key={device.id} className="group hover:bg-emerald-950/20 transition-colors duration-150">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-950/30 group-hover:bg-emerald-900/30 transition-colors shrink-0">
                      <FiSmartphone className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/devices/${device.id}`} className="text-sm font-mono text-emerald-300 hover:text-emerald-400 transition-colors truncate block">
                        {device.deviceName}
                      </Link>
                      <code className="text-[10px] font-mono text-emerald-700">{device.deviceId.slice(0, 12)}...</code>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs font-mono text-emerald-500 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/30">
                    {device.androidVersion || "—"}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-xs font-mono text-emerald-600">{device.appVersion || "—"}</span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("h-1.5 w-1.5 rounded-full", device.status === "online" ? "bg-emerald-500 animate-pulse" : "bg-red-900/60")} />
                    <span className={cn("text-xs font-mono", device.status === "online" ? "text-emerald-400" : "text-red-500/60")}>
                      {device.status === "online" ? "ONLINE" : "OFFLINE"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden xl:table-cell">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono text-emerald-400">{timeAgo(device.lastSeen)}</span>
                    <span className="text-[10px] font-mono text-emerald-700">{formatDate(device.lastSeen)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline-flex text-emerald-600 hover:text-emerald-400 hover:bg-emerald-500/10">
                      <Link href={`/devices/${device.id}`}>
                        <FiEye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Link href={`/devices/${device.id}`} className="sm:hidden inline-flex items-center gap-1 text-xs font-mono text-emerald-500 hover:text-emerald-400 transition-colors">
                      view <FiChevronRight className="h-3 w-3" />
                    </Link>
                    {role === "admin" && (
                      <Dialog open={deleteId === device.id} onOpenChange={(open) => setDeleteId(open ? device.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-700/50 hover:text-red-400 hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all hidden sm:inline-flex">
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="border-red-900/30 bg-black">
                          <DialogHeader>
                            <DialogTitle className="font-mono text-emerald-400">Delete Device</DialogTitle>
                            <DialogDescription className="font-mono text-emerald-600 text-xs">
                              Are you sure you want to delete <strong className="text-emerald-400">{device.deviceName}</strong>? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteId(null)} className="border-emerald-900/30 text-emerald-500 hover:bg-emerald-950/30 font-mono text-xs">
                              cancel
                            </Button>
                            <Button variant="destructive" onClick={() => { onDelete?.(device.id); setDeleteId(null); }} disabled={isDeleting} className="font-mono text-xs">
                              {isDeleting ? "deleting..." : "delete --force"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
