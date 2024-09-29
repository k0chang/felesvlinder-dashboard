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
>(({ type, className, ...props }, ref) => (
  <span {...props} ref={ref} className={cn(className, "align-text-bottom")}>
    {type === "bold" && <Bold className={className} />}
    {type === "italic" && <Italic className={className} />}
    {type === "underline" && <Underline className={className} />}
    {type === "link" && <Link />}
    {type === "code" && <Code className={className} />}
    {type === "heading-1" && <Heading1 className={className} />}
    {type === "heading-2" && <Heading2 className={className} />}
    {type === "heading-3" && <Heading3 className={className} />}
    {type === "numbered-list" && <ListOrdered className={className} />}
    {type === "bulleted-list" && <List className={className} />}
    {type === "unlink" && <Unlink className={className} />}
  </span>
));
Icon.displayName = "Icon";
