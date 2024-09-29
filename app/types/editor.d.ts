import { BaseEditor, Descendant } from "slate";
import { HistoryEditor } from "slate-history";
import { ReactEditor } from "slate-react";

export type ParagraphElement = {
  type: "paragraph";
  children: Descendant[];
};

export type BoldElement = {
  type: "bold";
  children: Descendant[];
};

export type ItalicElement = {
  type: "italic";
  children: Descendant[];
};

export type UnderlineElement = {
  type: "underline";
  children: Descendant[];
};

export type HeadingElement = {
  type: `heading-${1 | 2 | 3 | 4 | 5 | 6}`;
  children: CustomText[];
};

export type LinkElement = {
  type: "link";
  url: string;
  children: Descendant[];
};

export type ListElement = {
  type: "bulleted-list" | "numbered-list";
  children: Descendant[];
};

export type ListItemElement = {
  type: "list-item";
  children: Descendant[];
};

export type CodeElement = {
  type: "code";
  children: Descendant[];
};

type CustomElement =
  | ParagraphElement
  | BoldElement
  | ItalicElement
  | UnderlineElement
  | HeadingElement
  | LinkElement
  | ListElement
  | ListItemElement
  | CodeElement;

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
