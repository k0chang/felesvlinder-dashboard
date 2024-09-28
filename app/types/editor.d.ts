import { BaseEditor } from "slate";
import { HistoryEditor } from "slate-history";
import { ReactEditor } from "slate-react";

export type ParagraphElement = {
  type: "paragraph";
  children: CustomText[];
};

export type BoldElement = {
  type: "bold";
  children: CustomText[];
};

export type ItalicElement = {
  type: "italic";
  children: CustomText[];
};

export type UnderlineElement = {
  type: "underline";
  children: CustomText[];
};

export type HeadingElement = {
  type: `heading-${1 | 2 | 3 | 4 | 5 | 6}`;
  children: CustomText[];
};

export type LinkElement = {
  type: "link";
  url: string;
  children: CustomText[];
};

export type ListElement = {
  type: "bulleted-list" | "numbered-list";
  children: CustomText[];
};

export type ListItemElement = {
  type: "list-item";
  children: CustomText[];
};

export type CodeElement = {
  type: "code";
  children: CustomText[];
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
  children?: CustomText[];
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  link?: boolean;
  href?: string;
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
