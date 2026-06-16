import { cn } from "@/lib/utils";
import { FiTerminal } from "react-icons/fi";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-emerald-900/30 bg-emerald-950/20">
        {icon || <FiTerminal className="h-6 w-6 text-emerald-600" />}
      </div>
      <h3 className="text-base font-mono text-emerald-400">{title}</h3>
      {description && <p className="mt-2 text-xs font-mono text-emerald-700 max-w-md leading-relaxed">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
