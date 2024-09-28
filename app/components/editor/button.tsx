import { ComponentProps, forwardRef } from "react";
import { Editor, Element as SlateElement, Transforms } from "slate";
import { useSlate } from "slate-react";
import { cn } from "~/lib/utils";
import { CustomElement } from "~/types/editor";
import { Icon } from "./icon";

export const Button = forwardRef<
  HTMLSpanElement,
  {
    active: boolean;
    reversed?: boolean;
  } & ComponentProps<"span">
>(({ className, active, reversed, ...props }, ref) => (
  <span
    {...props}
    ref={ref}
    className={cn(
      className,
      "cursor-pointer p-1",
      reversed
        ? active
          ? "text-white"
          : "text-gray-400"
        : active
        ? "text-black"
        : "text-gray-300"
    )}
  />
));
Button.displayName = "Button";

export const MarkButton = ({ format }: { format: CustomElement["type"] }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon type={format}></Icon>
    </Button>
  );
};

export const isMarkActive = (editor: Editor, format: string) => {
  const marks: Record<string, unknown> | null = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const toggleMark = (editor: Editor, format: string) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export function BlockButton({ format }: { format: CustomElement["type"] }) {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon type={format}></Icon>
    </Button>
  );
}

export const isBlockActive = (
  editor: Editor,
  format: CustomElement["type"]
) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    })
  );

  return !!match;
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];

export const toggleBlock = (editor: Editor, format: CustomElement["type"]) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type),
    split: true,
  });

  const newProperties = {
    type: isActive ? "paragraph" : isList ? "list-item" : format,
  };

  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};
