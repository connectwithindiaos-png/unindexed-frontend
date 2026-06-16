"use client";

import { useState } from "react";
import Link from "next/link";
import type { Device } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { formatDate, timeAgo } from "@/lib/utils";
import { FiSmartphone, FiTrash2, FiEye, FiChevronRight } from "react-icons/fi";
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
    <div className="flex items-center gap-4 p-4 border-b border-border/50">
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

export function DeviceTable({
  devices,
  loading,
  error,
  onRetry,
  onDelete,
  isDeleting,
  role,
}: DeviceTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (error) {
    return (
      <ErrorState
        title="Failed to load devices"
        message={error.message}
        onRetry={onRetry}
      />
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border bg-card overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <EmptyState
        icon={<FiSmartphone className="h-6 w-6 text-muted-foreground" />}
        title="No devices found"
        description="No devices have been registered yet. Devices will appear here once they connect."
      />
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Device
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                Android
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                App
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                Status
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">
                Last Seen
              </th>
              <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {devices.map((device) => (
              <tr
                key={device.id}
                className="group hover:bg-muted/30 transition-colors duration-150"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors shrink-0">
                      <FiSmartphone className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/devices/${device.id}`}
                        className="text-sm font-medium hover:text-primary transition-colors truncate block"
                      >
                        {device.deviceName}
                      </Link>
                      <code className="text-xs text-muted-foreground">
                        {device.deviceId.slice(0, 12)}...
                      </code>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <Badge variant="secondary" className="text-xs font-medium">
                    {device.androidVersion || "—"}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {device.appVersion || "—"}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <StatusBadge status={device.status} />
                </td>
                <td className="px-4 py-3 hidden xl:table-cell">
                  <div className="flex flex-col">
                    <span className="text-sm">{timeAgo(device.lastSeen)}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(device.lastSeen)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline-flex">
                      <Link href={`/devices/${device.id}`}>
                        <FiEye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Link
                      href={`/devices/${device.id}`}
                      className="sm:hidden inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      View
                      <FiChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    {role === "admin" && (
                      <Dialog
                        open={deleteId === device.id}
                        onOpenChange={(open) =>
                          setDeleteId(open ? device.id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all hidden sm:inline-flex"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Device</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete{" "}
                              <strong>{device.deviceName}</strong>? This action
                              cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setDeleteId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                onDelete?.(device.id);
                                setDeleteId(null);
                              }}
                              disabled={isDeleting}
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
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
