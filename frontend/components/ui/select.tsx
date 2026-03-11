import * as React from "react";
import { cn } from "@/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border border-slate-300/80 bg-white/85 px-3 py-2 text-sm shadow-sm backdrop-blur-md transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "dark:border-slate-500/35 dark:bg-slate-900/70",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

