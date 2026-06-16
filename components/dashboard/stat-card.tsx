import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  loading?: boolean;
  className?: string;
  accent?: "emerald" | "cyan" | "amber" | "violet";
}

export function StatCard({ title, value, icon, description, loading, className, accent = "emerald" }: StatCardProps) {
  const accentColors = {
    emerald: { border: "border-emerald-500/20", bg: "bg-emerald-950/20", glow: "shadow-[0_0_15px_rgba(52,211,153,0.06)]", text: "text-emerald-400", iconBg: "bg-emerald-500/10", iconBorder: "border-emerald-500/30" },
    cyan: { border: "border-cyan-500/20", bg: "bg-cyan-950/20", glow: "shadow-[0_0_15px_rgba(34,211,238,0.06)]", text: "text-cyan-400", iconBg: "bg-cyan-500/10", iconBorder: "border-cyan-500/30" },
    amber: { border: "border-amber-500/20", bg: "bg-amber-950/20", glow: "shadow-[0_0_15px_rgba(251,191,36,0.06)]", text: "text-amber-400", iconBg: "bg-amber-500/10", iconBorder: "border-amber-500/30" },
    violet: { border: "border-violet-500/20", bg: "bg-violet-950/20", glow: "shadow-[0_0_15px_rgba(168,85,247,0.06)]", text: "text-violet-400", iconBg: "bg-violet-500/10", iconBorder: "border-violet-500/30" },
  };

  const c = accentColors[accent];

  if (loading) {
    return (
      <div className={cn("rounded-xl border border-emerald-900/30 bg-black/60 p-5", className)}>
        <div className="space-y-3">
          <div className="shimmer h-3 w-24 rounded" />
          <div className="shimmer h-8 w-16 rounded" />
          {description && <div className="shimmer h-3 w-32 rounded" />}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("group rounded-xl border transition-all duration-300 hover:-translate-y-0.5", c.border, c.bg, c.glow, className)}>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 min-w-0">
            <p className="text-xs font-mono text-emerald-600/80 tracking-wide">{title}</p>
            <p className={cn("text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums", c.text)}>
              {value}
            </p>
            {description && (
              <p className="text-[10px] font-mono text-emerald-700/60">{description}</p>
            )}
          </div>
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 group-hover:scale-110", c.iconBorder, c.iconBg)}>
            {icon}
          </div>
        </div>
      </div>
      <div className={cn("h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full", accent === "emerald" ? "bg-emerald-500/30" : accent === "cyan" ? "bg-cyan-500/30" : accent === "amber" ? "bg-amber-500/30" : "bg-violet-500/30")} />
    </div>
  );
}
