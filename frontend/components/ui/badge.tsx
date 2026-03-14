import type { ReactNode } from "react";
import { cn } from "@/utils";

export const Badge = ({
  className,
  children,
  variant = "default"
}: {
  className?: string;
  children: ReactNode;
  variant?: "default" | "secondary" | "success" | "danger" | "warning";
}) => {
  const styles = {
    default: "border-primary/35 bg-primary/15 text-primary",
    secondary: "border-border/70 bg-muted/65 text-foreground",
    success: "border-emerald-400/40 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    danger: "border-red-400/40 bg-red-500/20 text-red-700 dark:text-red-300",
    warning: "border-amber-400/40 bg-amber-500/20 text-amber-700 dark:text-amber-300"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
