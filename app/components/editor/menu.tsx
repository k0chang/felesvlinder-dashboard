import { ComponentProps, forwardRef } from "react";
import { cn } from "~/lib/utils";

export const Menu = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      data-test-id="menu"
      ref={ref}
      className={cn("flex-wrap", className)}
    />
  )
);
Menu.displayName = "Menu";
