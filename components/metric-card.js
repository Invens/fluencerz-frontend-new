import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({ title, value, subtitle, icon, trend, className }) {
  return (
    <Card
      className={cn(
        "p-6 hover:shadow-lg transition-all duration-200 border-border/50 bg-card/50 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  trend.isPositive
                    ? "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20"
                    : "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
