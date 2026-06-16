"use client";

import { useState } from "react";
import { useDevices, useDeleteDevice } from "@/hooks/useDevices";
import { useAuthStore } from "@/store/authStore";
import { DeviceTable } from "@/components/tables/device-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FiChevronLeft, FiChevronRight, FiSearch, FiRefreshCw, FiTerminal } from "react-icons/fi";
import { cn } from "@/lib/utils";

export default function DevicesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("last_seen");
  const [sortOrder, setSortOrder] = useState("desc");
  const limit = 10;

  const { data, isLoading, error, refetch, isFetching } = useDevices({ search, status, sortBy, sortOrder: sortOrder as "asc" | "desc", page, limit });
  const role = useAuthStore((s) => s.role);
  const deleteMutation = useDeleteDevice();

  const handleDelete = (id: string) => { if (role !== "admin") return; deleteMutation.mutate(id); };
  const handleSearch = (value: string) => { setSearch(value); setPage(1); };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-600/60 tracking-widest mb-1">
            <FiTerminal className="h-3 w-3" /> DEVICES / LIST
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">Devices</h1>
          <p className="text-xs font-mono text-emerald-700 mt-1">Monitor all connected devices in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            auto-refresh
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}
            className="text-emerald-600 hover:text-emerald-400 hover:bg-emerald-950/30 font-mono text-xs border border-emerald-900/30">
            <FiRefreshCw className={`mr-1.5 h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
            refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700" />
          <Input
            placeholder="Search by device name or ID..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-black/50 border-emerald-900/40 text-emerald-300 placeholder:text-emerald-800 h-9 text-xs font-mono focus-visible:ring-emerald-500/30"
          />
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-[120px] h-9 bg-black/50 border-emerald-900/40 text-emerald-400 text-xs font-mono">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-emerald-900/30 bg-black text-emerald-300">
              <SelectItem value="all" className="font-mono text-xs">all</SelectItem>
              <SelectItem value="online" className="font-mono text-xs">online</SelectItem>
              <SelectItem value="offline" className="font-mono text-xs">offline</SelectItem>
            </SelectContent>
          </Select>
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => { const [f, o] = v.split("-"); setSortBy(f); setSortOrder(o); setPage(1); }}>
            <SelectTrigger className="w-[150px] h-9 bg-black/50 border-emerald-900/40 text-emerald-400 text-xs font-mono">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="border-emerald-900/30 bg-black text-emerald-300">
              <SelectItem value="last_seen-desc" className="font-mono text-xs">last_seen ↓</SelectItem>
              <SelectItem value="last_seen-asc" className="font-mono text-xs">last_seen ↑</SelectItem>
              <SelectItem value="device_name-asc" className="font-mono text-xs">name A-Z</SelectItem>
              <SelectItem value="device_name-desc" className="font-mono text-xs">name Z-A</SelectItem>
              <SelectItem value="created_at-desc" className="font-mono text-xs">newest</SelectItem>
              <SelectItem value="created_at-asc" className="font-mono text-xs">oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Device Table */}
      <DeviceTable devices={data?.devices ?? []} loading={isLoading} error={error} onRetry={() => refetch()} onDelete={handleDelete} isDeleting={deleteMutation.isPending} role={role} />

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-mono text-emerald-700 order-2 sm:order-1">
            [{(page - 1) * limit + 1}..{Math.min(page * limit, data.total)}] / {data.total} devices
          </p>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
              className="border-emerald-900/30 text-emerald-500 hover:bg-emerald-950/30 h-8 px-2">
              <FiChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === data.totalPages || Math.abs(p - page) <= 1).map((p, idx, arr) => (
              <span key={p} className="flex items-center">
                {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-emerald-700 text-xs">...</span>}
                <button onClick={() => setPage(p)}
                  className={cn("min-w-[28px] h-8 text-xs font-mono rounded border transition-all",
                    page === p
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                      : "bg-transparent border-emerald-900/30 text-emerald-600 hover:border-emerald-700/50"
                  )}
                >{p}</button>
              </span>
            ))}
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages}
              className="border-emerald-900/30 text-emerald-500 hover:bg-emerald-950/30 h-8 px-2">
              <FiChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
