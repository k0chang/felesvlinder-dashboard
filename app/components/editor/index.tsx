import isHotkey from "is-hotkey";
import { KeyboardEvent, useCallback, useMemo } from "react";
import {
  createEditor,
  Descendant,
  Editor,
  Range,
  Element as SlateElement,
  Transforms,
} from "slate";
import { withHistory } from "slate-history";
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  withReact,
} from "slate-react";
import { z } from "zod";
import { cn } from "~/lib/utils";
import { LinkElement } from "~/types/editor";
import {
  AddLinkButton,
  BlockButton,
  MarkButton,
  RemoveLinkButton,
  toggleMark,
} from "./button";
import { Element } from "./element";
import { Leaf } from "./leaf";
import { Toolbar } from "./toolbar";

type Props = {
  initialValue: Descendant[];
  onChange: (value: Descendant[]) => void;
  classNames?: {
    root?: string;
    toolbar?: string;
    editor?: string;
  };
};

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
} as const;

export function RichTextEditor({ initialValue, classNames, onChange }: Props) {
  const renderElement = useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    []
  );
  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    []
  );
  const editor = useMemo(
    () => withInlines(withHistory(withReact(createEditor()))),
    []
  );

  function onKeyDown(event: KeyboardEvent) {
    for (const hotkey in HOTKEYS) {
      if (isHotkey(hotkey, event)) {
        event.preventDefault();
        const mark = HOTKEYS[hotkey as keyof typeof HOTKEYS];
        toggleMark(editor, mark);
      }
    }
  }

  return (
    <Slate editor={editor} initialValue={initialValue} onChange={onChange}>
      <div className={classNames?.root}>
        <Toolbar className={classNames?.toolbar}>
          <MarkButton format="bold" />
          <MarkButton format="italic" />
          <MarkButton format="underline" />
          <MarkButton format="code" />
          <AddLinkButton />
          <RemoveLinkButton />
          <BlockButton format="heading-1" />
          <BlockButton format="heading-2" />
          <BlockButton format="heading-3" />
          <BlockButton format="numbered-list" />
          <BlockButton format="bulleted-list" />
        </Toolbar>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="ネコと和解せよ"
          renderPlaceholder={(props) => (
            <div {...props} className="text-gray-400" />
          )}
          spellCheck
          onKeyDown={onKeyDown}
          className={cn(
            "p-5 border-x-0 border-gray-400 border-b border-t-0 sm:border-x focus:outline-none min-h-[300px] max-h-[500px] overflow-y-auto placeholder:pt-5",
            classNames?.editor
          )}
        />
      </div>
    </Slate>
  );
}

export const isUrl = (text: string): boolean =>
  z.string().url().safeParse(text).success;

const withInlines = (editor: Editor) => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = (element) =>
    ["link"].includes(element.type) || isInline(element);

  editor.insertText = (text) => {
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.insertText = (text) => {
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = (data) => {
    const text = data.getData("text/plain");

    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

const isLinkActive = (editor: Editor) => {
  const [link] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
  });
  return !!link;
};

export const unwrapLink = (editor: Editor) => {
  const { selection } = editor;
  if (!selection) return;
  Transforms.unwrapNodes<LinkElement>(editor, {
    split: true,
    match: (n) => {
      return (
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n.type === "link" &&
        Range.isCollapsed(selection)
      );
    },
  });
};

export const wrapLink = (editor: Editor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link: LinkElement = {
    type: "link",
    url,
    children: [{ text: isCollapsed ? url : "" }],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link, { at: selection });
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: "end" });
  }
};
