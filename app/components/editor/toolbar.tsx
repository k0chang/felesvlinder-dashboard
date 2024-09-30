import { ComponentProps, forwardRef } from "react";
import { cn } from "~/lib/utils";
import { Menu } from "./menu";

export const Toolbar = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <Menu
      {...props}
      ref={ref}
      className={cn(
        className,
        "relative flex border-x-0 sm:border-x border-t border-b-2 border-gray-400"
      )}
    />
  )
);
Toolbar.displayName = "Toolbar";
