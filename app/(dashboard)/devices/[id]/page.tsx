"use client";

import { useParams, useRouter } from "next/navigation";
import { useDevice, useDeleteDevice } from "@/hooks/useDevices";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import {
  FiSmartphone,
  FiArrowLeft,
  FiTrash2,
  FiGlobe,
  FiHash,
  FiCpu,
  FiPackage,
  FiClock,
  FiCalendar,
  FiActivity,
} from "react-icons/fi";

export default function DeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data, isLoading, error, refetch } = useDevice(id);
  const deleteMutation = useDeleteDevice();

  const device = data?.device;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !device) {
    return (
      <ErrorState
        title="Device not found"
        message={error?.message || "The device you're looking for doesn't exist."}
        onRetry={() => refetch()}
      />
    );
  }

  const handleDelete = () => {
    deleteMutation.mutate(device.id, {
      onSuccess: () => router.push("/devices"),
    });
  };

  const infoItems = [
    { label: "Device Name", value: device.deviceName, icon: FiSmartphone },
    { label: "Device ID", value: device.deviceId, icon: FiHash },
    { label: "Android Version", value: device.androidVersion || "—", icon: FiCpu },
    { label: "App Version", value: device.appVersion || "—", icon: FiPackage },
    { label: "IP Address", value: device.ipAddress || "—", icon: FiGlobe },
    { label: "Status", value: "", icon: FiActivity, custom: <StatusBadge status={device.status} /> },
    { label: "Last Seen", value: formatDate(device.lastSeen), icon: FiClock },
    { label: "Created", value: formatDate(device.createdAt), icon: FiCalendar },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <FiArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {device.deviceName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Device details and information
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <FiTrash2 className="mr-2 h-4 w-4" />
          {deleteMutation.isPending ? "Deleting..." : "Delete Device"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Device Information</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </p>
                  {item.custom || (
                    <p className="text-sm font-medium mt-0.5">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
