import { cn } from "@/lib/utils";
import { FiTerminal } from "react-icons/fi";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeMap = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className="flex items-center gap-1">
        <span className={cn("animate-pulse text-emerald-500", sizeMap[size])}>[</span>
        <FiTerminal className={cn("animate-pulse text-emerald-500", sizeMap[size])} />
        <span className={cn("animate-pulse text-emerald-500", sizeMap[size])}>]</span>
      </div>
      <span className="text-[10px] font-mono text-emerald-700 animate-pulse">loading...</span>
    </div>
  );
}
