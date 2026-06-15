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
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { formatDate, timeAgo } from "@/lib/utils";
import { FiSmartphone, FiTrash2, FiEye } from "react-icons/fi";

interface DeviceTableProps {
  devices: Device[];
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function DeviceTable({
  devices,
  loading,
  error,
  onRetry,
  onDelete,
  isDeleting,
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
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
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
    <div className="rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Device Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Device ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Android
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                App
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Last Seen
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {devices.map((device) => (
              <tr
                key={device.id}
                className="group hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <FiSmartphone className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">
                      {device.deviceName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <code className="text-xs text-muted-foreground">
                    {device.deviceId.slice(0, 16)}...
                  </code>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="text-xs">
                    {device.androidVersion || "—"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {device.appVersion || "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={device.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-sm">{timeAgo(device.lastSeen)}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(device.lastSeen)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(device.createdAt)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/devices/${device.id}`}>
                        <FiEye className="h-4 w-4" />
                      </Link>
                    </Button>
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
                          className="text-destructive hover:text-destructive"
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
