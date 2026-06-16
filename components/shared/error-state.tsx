import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ title = "Error", message = "An error occurred while loading data.", onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-red-900/30 bg-red-950/20">
        <FiAlertCircle className="h-6 w-6 text-red-500" />
      </div>
      <h3 className="text-base font-mono text-red-400">{title}</h3>
      <p className="mt-2 text-xs font-mono text-red-700/80 max-w-md">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-6 border-red-900/30 text-red-500 hover:bg-red-950/30 font-mono text-xs" onClick={onRetry}>
          <FiRefreshCw className="mr-2 h-3 w-3" /> retry
        </Button>
      )}
    </div>
  );
}
