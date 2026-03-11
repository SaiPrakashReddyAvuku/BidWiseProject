import type { ReactNode } from "react";
import { cn } from "@/utils";

export const Badge = ({
  className,
  children,
  variant = "default"
}: {
  className?: string;
  children: ReactNode;
  variant?: "default" | "secondary" | "success" | "danger";
}) => {
  const styles = {
    default: "bg-primary/15 text-primary",
    secondary: "bg-white/82 text-foreground dark:bg-slate-900/75",
    success: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    danger: "bg-red-500/20 text-red-700 dark:text-red-300"
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border border-white/30 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md", styles[variant], className)}>
      {children}
    </span>
  );
};

