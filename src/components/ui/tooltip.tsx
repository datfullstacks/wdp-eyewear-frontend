import * as React from "react";
import { cn } from "@/lib/utils";

const TooltipProvider = ({ children }: any) => <>{children}</>;
const Tooltip = ({ children }: any) => <>{children}</>;
const TooltipTrigger = ({ children }: any) => <>{children}</>;

const TooltipContent = React.forwardRef<HTMLDivElement, any>(
  ({ className, side: _side, align: _align, sideOffset: _sideOffset, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground",
        className
      )}
      {...props}
    />
  )
);
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
