import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "online" | "offline";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-mono tracking-wider",
      status === "online" ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-400" : "border-red-900/40 bg-red-950/20 text-red-500/60"
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full", status === "online" ? "bg-emerald-500 animate-pulse" : "bg-red-800")} />
      {status.toUpperCase()}
    </div>
  );
}
