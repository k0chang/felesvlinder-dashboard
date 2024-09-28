import { forwardRef } from "react";
import { cn } from "~/lib/utils";

export const EditorValue = forwardRef<
  HTMLDivElement,
  { className: string; value: unknown }
>(({ className, value, ...props }, ref) => {
  const textLines = (value.document.nodes as unknown[])
    .map((node) => node.text)
    .toArray()
    .join("\n");
  return (
    <div
      ref={ref}
      {...props}
      className={cn(className, "m-[30px] -mx-[20px] mt-0")}
    >
      <div className="text-sm p-2 border-t-2 border-gray-200 bg-gray-100">
        Slate&apos;s value as text
      </div>
      <div className="text-xs font-mono whitespace-pre-wrap p-2 [&_div]:m-[0_0_0.5em]">
        {textLines}
      </div>
    </div>
  );
});
EditorValue.displayName = "EditorValue";
