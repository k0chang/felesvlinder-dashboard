import isHotkey from "is-hotkey";
import { useCallback, useMemo } from "react";
import { createEditor, Descendant, Transforms } from "slate";
import { withHistory } from "slate-history";
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  withReact,
} from "slate-react";
import { cn } from "~/lib/utils";
import { BlockButton, isMarkActive, MarkButton, toggleMark } from "./button";
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
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={(val) => {
        if (isMarkActive(editor, "link")) {
          const selection = editor.selection;
          if (selection) {
            const link = window.prompt("Enter the URL of the link:");
            if (link) {
              Transforms.wrapNodes(
                editor,
                { type: "link", url: link, children: [] },
                { at: selection }
              );
            }
          }
        }
        onChange(val);
      }}
    >
      <div className={classNames?.root}>
        <Toolbar className={classNames?.toolbar}>
          <MarkButton format="bold" />
          <MarkButton format="italic" />
          <MarkButton format="underline" />
          <MarkButton format="code" />
          <MarkButton format="link" />
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
          onKeyDown={(event) => {
            for (const hotkey in HOTKEYS) {
              if (isHotkey(hotkey, event)) {
                event.preventDefault();
                const mark = HOTKEYS[hotkey as keyof typeof HOTKEYS];
                toggleMark(editor, mark);
              }
            }
          }}
          className={cn(
            "p-5 border border-gray-400 border-t-0 focus:outline-none min-h-[300px] max-h-[500px] overflow-y-auto placeholder:pt-5",
            classNames?.editor
          )}
        />
      </div>
    </Slate>
  );
}
