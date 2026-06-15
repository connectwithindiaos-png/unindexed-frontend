import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  loading?: boolean;
  className?: string;
}

function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-md", className)} />;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  loading,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <SkeletonBar className="h-3 w-24" />
              <SkeletonBar className="h-8 w-16" />
              {description && <SkeletonBar className="h-3 w-32" />}
            </div>
            <SkeletonBar className="h-10 w-10 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight tabular-nums">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground/80">{description}</p>
            )}
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
