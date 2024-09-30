import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListOrdered,
  Underline,
  Unlink,
} from "lucide-react";
import { ComponentProps, forwardRef } from "react";
import { cn } from "~/lib/utils";
import { CustomElement } from "~/types/editor";

export const Icon = forwardRef<
  HTMLSpanElement,
  ComponentProps<"span"> & { type: CustomElement["type"] | "unlink" }
>(({ type, className, ...props }, ref) => {
  const strokeProps = {
    strokeLinecap: "square" as const,
    strokeLinejoin: "miter" as const,
  };
  return (
    <span {...props} ref={ref} className={cn(className, "align-text-bottom")}>
      {type === "bold" && <Bold {...strokeProps} className={className} />}
      {type === "italic" && <Italic {...strokeProps} className={className} />}
      {type === "underline" && (
        <Underline
          {...strokeProps}
          strokeLinejoin="miter"
          className={className}
        />
      )}
      {type === "link" && <Link {...strokeProps} />}
      {type === "code" && (
        <Code {...strokeProps} strokeLinejoin="miter" className={className} />
      )}
      {type === "heading-1" && (
        <Heading1 {...strokeProps} className={className} />
      )}
      {type === "heading-2" && (
        <Heading2 {...strokeProps} className={className} />
      )}
      {type === "heading-3" && (
        <Heading3 {...strokeProps} className={className} />
      )}
      {type === "numbered-list" && (
        <ListOrdered {...strokeProps} className={className} />
      )}
      {type === "bulleted-list" && (
        <List {...strokeProps} className={className} />
      )}
      {type === "unlink" && <Unlink {...strokeProps} className={className} />}
    </span>
  );
});
Icon.displayName = "Icon";
