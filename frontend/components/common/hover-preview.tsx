import { ReactNode } from "react";
import { cn } from "@/utils";

type HoverPreviewProps = {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  previewClassName?: string;
};

export function HoverPreview({ trigger, children, className, previewClassName }: HoverPreviewProps) {
  return (
    <div className={cn("group/preview relative inline-flex", className)}>
      {trigger}
      <div
        className={cn(
          "preview-surface pointer-events-none absolute left-1/2 top-full z-50 mt-3 w-72 -translate-x-1/2",
          "origin-top scale-95 opacity-0 transition-all duration-200 ease-out delay-100",
          "group-hover/preview:translate-y-0 group-hover/preview:scale-100 group-hover/preview:opacity-100",
          "group-focus-within/preview:translate-y-0 group-focus-within/preview:scale-100 group-focus-within/preview:opacity-100",
          previewClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
