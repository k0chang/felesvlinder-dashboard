import { ComponentProps, forwardRef, MouseEvent } from "react";
import { Editor, Element as SlateElement, Transforms } from "slate";
import { useSlate } from "slate-react";
import { cn } from "~/lib/utils";
import { CustomElement } from "~/types/editor";
import { unwrapLink, wrapLink } from ".";
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

export function MarkButton({ format }: { format: CustomElement["type"] }) {
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
}

export function AddLinkButton() {
  const editor = useSlate();

  function handleEvent(event: MouseEvent) {
    event.preventDefault();
    const url = window.prompt("埋め込むURLを入力");
    if (!url) return;
    insertLink(editor, url);
  }

  return (
    <Button active={isLinkActive(editor)} onClick={handleEvent}>
      <Icon type="link" />
    </Button>
  );
}

export function RemoveLinkButton() {
  const editor = useSlate();

  function handleEvent(event: MouseEvent) {
    event.preventDefault();
    unwrapLink(editor);
  }

  return (
    <Button active={isLinkActive(editor)} onClick={handleEvent}>
      <Icon type="unlink" />
    </Button>
  );
}

const insertLink = (editor: Editor, url: string) => {
  if (editor.selection) {
    wrapLink(editor, url);
  }
};

export const isLinkActive = (editor: Editor) => {
  const [link] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
  });
  return !!link;
};

export const isMarkActive = (editor: Editor, format: CustomElement["type"]) => {
  const marks: Record<string, unknown> | null = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const toggleMark = (editor: Editor, format: CustomElement["type"]) => {
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
      <Icon type={format} />
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
    const block: CustomElement = {
      type: format as Exclude<CustomElement["type"], "link">,
      children: [{ text: "" }],
    };
    Transforms.wrapNodes(editor, block);
  }
};
