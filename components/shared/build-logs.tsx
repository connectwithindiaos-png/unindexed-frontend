"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { streamSSE, downloadApk } from "@/services/api";
import { FiTerminal, FiDownload, FiX, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface LogEntry {
  type: "log" | "complete" | "error";
  message: string;
  timestamp: string;
}

interface BuildLogsProps {
  sseUrl: string;
  downloadUrl: string;
  filename: string;
  onClose: () => void;
}

export function BuildLogs({ sseUrl, downloadUrl, filename, onClose }: BuildLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<"streaming" | "complete" | "error">("streaming");
  const containerRef = useRef<HTMLDivElement>(null);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;

    const abortController = new AbortController();

    streamSSE(
      sseUrl,
      token,
      (data) => {
        try {
          const entry: LogEntry = JSON.parse(data);
          setLogs((prev) => [...prev, entry]);

          if (entry.type === "complete") {
            setStatus("complete");
            downloadApk(downloadUrl, filename);
          } else if (entry.type === "error") {
            setStatus("error");
          }
        } catch {
          // ignore parse errors
        }
      },
      (err) => {
        setLogs((prev) => [
          ...prev,
          { type: "error" as const, message: err.message, timestamp: new Date().toISOString() },
        ]);
        setStatus("error");
      },
      abortController.signal
    );

    return () => abortController.abort();
  }, [sseUrl, downloadUrl, filename, token]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-black/80 p-4 animate-slide-up box-glow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-600/80">
          <FiTerminal className="h-3 w-3" /> BUILD_LOGS
        </div>
        <button onClick={onClose} className="text-emerald-700 hover:text-emerald-400 transition-colors">
          <FiX className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={containerRef}
        className="h-48 overflow-y-auto font-mono text-xs space-y-1 bg-black/60 rounded-lg p-3 border border-emerald-900/20"
      >
        {logs.length === 0 && status === "streaming" && (
          <div className="text-emerald-700">Connecting to build server...</div>
        )}
        {logs.map((log, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-2",
              log.type === "error" ? "text-red-400" : log.type === "complete" ? "text-emerald-400" : "text-emerald-500/80"
            )}
          >
            <span className="shrink-0 text-emerald-700 select-none">
              {log.type === "error" ? <FiAlertCircle className="h-3 w-3 mt-0.5 text-red-400" /> :
               log.type === "complete" ? <FiCheckCircle className="h-3 w-3 mt-0.5 text-emerald-400" /> :
               "$"}
            </span>
            <span className="whitespace-pre-wrap break-all">{log.message}</span>
          </div>
        ))}
        {status === "streaming" && logs.length > 0 && (
          <div className="flex items-center gap-1 text-emerald-600">
            <span className="animate-pulse">█</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-mono">
          {status === "streaming" && (
            <span className="text-emerald-600">Processing...</span>
          )}
          {status === "complete" && (
            <span className="text-emerald-400 flex items-center gap-1.5">
              <FiDownload className="h-3 w-3" /> Downloading APK...
            </span>
          )}
          {status === "error" && (
            <span className="text-red-400 flex items-center gap-1.5">
              <FiAlertCircle className="h-3 w-3" /> Build failed
            </span>
          )}
        </div>
        {status === "complete" && (
          <button
            onClick={() => downloadApk(downloadUrl, filename)}
            className="text-[10px] font-mono text-emerald-500 hover:text-emerald-400 border border-emerald-900/30 px-2 py-1 rounded transition-all"
          >
            download again
          </button>
        )}
      </div>
    </div>
  );
}
