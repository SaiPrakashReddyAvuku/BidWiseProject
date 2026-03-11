import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "destructive";
  size?: "default" | "sm" | "lg";
  asChild?: boolean;
}

const variants = {
  default: "bg-primary text-primary-foreground shadow-lg shadow-sky-700/25 hover:-translate-y-0.5 hover:brightness-110",
  outline: "border border-slate-300/80 bg-white/85 text-foreground hover:bg-white dark:border-slate-500/35 dark:bg-slate-900/70 dark:hover:bg-slate-900",
  secondary: "bg-muted/80 text-foreground hover:bg-muted",
  destructive: "bg-red-600 text-white hover:bg-red-700"
};

const sizes = {
  default: "h-10 px-4 py-2",
  sm: "h-8 px-3 text-sm",
  lg: "h-11 px-6"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium backdrop-blur-md transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

