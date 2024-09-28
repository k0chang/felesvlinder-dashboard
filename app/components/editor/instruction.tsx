import { ComponentProps, forwardRef } from "react";
import { cn } from "~/lib/utils";

export const Instruction = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      className={cn(className, "whitespace-nowrap m-0 text-sm bg-[#f8f8e8]")}
    />
  )
);
Instruction.displayName = "Instruction";
