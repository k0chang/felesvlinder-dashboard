import { RenderLeafProps } from "slate-react";

export function Leaf({ attributes, children, leaf }: RenderLeafProps) {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.code) {
    children = <code>{children}</code>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  if (leaf.link) {
    children = (
      <a href={leaf.href} className="text-[#a10005]">
        {children}
      </a>
    );
  }

  return <span {...attributes}>{children}</span>;
}
