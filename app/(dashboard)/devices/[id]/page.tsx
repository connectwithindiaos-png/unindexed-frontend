"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDevice, useDeleteDevice, useDeviceSms, useDeviceContacts, useDeviceFiles, useDeviceCallLogs } from "@/hooks/useDevices";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  FiSmartphone, FiArrowLeft, FiTrash2, FiGlobe, FiHash,
  FiCpu, FiPackage, FiClock, FiCalendar, FiActivity,
  FiMessageSquare, FiUsers, FiFolder, FiMail, FiPhone, FiPhoneCall,
} from "react-icons/fi";

type Tab = "info" | "sms" | "contacts" | "files" | "calllogs";

export default function DeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [tab, setTab] = useState<Tab>("info");

  const { data, isLoading, error, refetch } = useDevice(id);
  const device = data?.device;
  const deviceId = device?.deviceId || "";

  const { data: smsData, isLoading: smsLoading } = useDeviceSms(deviceId);
  const { data: contactsData, isLoading: contactsLoading } = useDeviceContacts(deviceId);
  const { data: filesData, isLoading: filesLoading } = useDeviceFiles(deviceId);
  const { data: callLogsData, isLoading: callLogsLoading } = useDeviceCallLogs(deviceId);
  const deleteMutation = useDeleteDevice();

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

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "info", label: "Info", icon: <FiSmartphone className="h-4 w-4" /> },
    { key: "sms", label: "SMS", icon: <FiMessageSquare className="h-4 w-4" />, count: smsData?.sms?.length },
    { key: "contacts", label: "Contacts", icon: <FiUsers className="h-4 w-4" />, count: contactsData?.contacts?.length },
    { key: "files", label: "Files", icon: <FiFolder className="h-4 w-4" />, count: filesData?.files?.length },
    { key: "calllogs", label: "Call Logs", icon: <FiPhoneCall className="h-4 w-4" />, count: callLogsData?.callLogs?.length },
  ];

  const infoItems = [
    { label: "Device Name", value: device.deviceName, icon: FiSmartphone },
    { label: "Device ID", value: device.deviceId, icon: FiHash },
    { label: "Android Version", value: device.androidVersion || "\u2014", icon: FiCpu },
    { label: "App Version", value: device.appVersion || "\u2014", icon: FiPackage },
    { label: "IP Address", value: device.ipAddress || "\u2014", icon: FiGlobe },
    { label: "Status", value: "", icon: FiActivity, custom: <StatusBadge status={device.status} /> },
    { label: "Last Seen", value: formatDate(device.lastSeen), icon: FiClock },
    { label: "Created", value: formatDate(device.createdAt), icon: FiCalendar },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <FiArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{device.deviceName}</h1>
            <p className="text-sm text-muted-foreground">Device details and collected data</p>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
          <FiTrash2 className="mr-2 h-4 w-4" />
          {deleteMutation.isPending ? "Deleting..." : "Delete Device"}
        </Button>
      </div>

      <div className="flex gap-1 border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">{t.count}</Badge>
            )}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <Card>
          <CardHeader><CardTitle>Device Information</CardTitle></CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                    {item.custom || <p className="text-sm font-medium mt-0.5">{item.value}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "sms" && (
        <Card>
          <CardHeader><CardTitle>SMS Messages ({smsData?.sms?.length || 0})</CardTitle></CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {smsLoading ? (
              <LoadingSpinner />
            ) : !smsData?.sms?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">No SMS data collected yet</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {smsData.sms.map((msg: any, i: number) => (
                  <div key={msg.id || i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <FiMessageSquare className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{msg.address}</span>
                        <Badge variant={msg.type === 1 ? "default" : "secondary"} className="text-[10px]">
                          {msg.type === 1 ? "Inbox" : "Sent"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">{msg.body}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {msg.date ? new Date(msg.date).toLocaleString() : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "contacts" && (
        <Card>
          <CardHeader><CardTitle>Contacts ({contactsData?.contacts?.length || 0})</CardTitle></CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {contactsLoading ? (
              <LoadingSpinner />
            ) : !contactsData?.contacts?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">No contacts collected yet</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {contactsData.contacts.map((c: any, i: number) => (
                  <div key={c.id || i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <FiUsers className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{c.name || "Unknown"}</p>
                      {c.phone_number && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <FiPhone className="h-3 w-3" /> {c.phone_number}
                        </div>
                      )}
                      {c.email && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <FiMail className="h-3 w-3" /> {c.email}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "files" && (
        <Card>
          <CardHeader><CardTitle>Files ({filesData?.files?.length || 0})</CardTitle></CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {filesLoading ? (
              <LoadingSpinner />
            ) : !filesData?.files?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">No files collected yet</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filesData.files.map((f: any, i: number) => (
                  <div key={f.id || i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <FiFolder className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{f.path}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        <span>{f.is_directory ? "Directory" : `${(f.size / 1024).toFixed(1)} KB`}</span>
                        {f.last_modified > 0 && <span>{new Date(f.last_modified).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "calllogs" && (
        <Card>
          <CardHeader><CardTitle>Call Logs ({callLogsData?.callLogs?.length || 0})</CardTitle></CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {callLogsLoading ? (
              <LoadingSpinner />
            ) : !callLogsData?.callLogs?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">No call logs collected yet</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {callLogsData.callLogs.map((c: any, i: number) => (
                  <div key={c.id || i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <FiPhoneCall className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{c.name || c.number || "Unknown"}</span>
                        <Badge variant={c.type === 1 ? "default" : c.type === 2 ? "secondary" : "outline"} className="text-[10px]">
                          {c.type === 1 ? "Incoming" : c.type === 2 ? "Outgoing" : "Missed"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.number}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        <span>{c.date ? new Date(c.date).toLocaleString() : ""}</span>
                        <span>{c.duration ? `${Math.floor(c.duration / 60)}:${(c.duration % 60).toString().padStart(2, "0")}` : "0:00"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
