import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "online" | "offline";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge
      variant={status === "online" ? "success" : "destructive"}
      className={cn(
        "flex items-center gap-1.5",
        status === "online" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        status === "offline" && "bg-red-500/10 text-red-600 dark:text-red-400"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "online" ? "bg-emerald-500" : "bg-red-500"
        )}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
