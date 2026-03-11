import * as React from "react";
import { cn } from "@/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-xl border border-slate-300/80 bg-white/85 px-3 py-2 text-sm text-foreground shadow-sm backdrop-blur-md ring-offset-background placeholder:text-muted-foreground transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "dark:border-slate-500/35 dark:bg-slate-900/70",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

