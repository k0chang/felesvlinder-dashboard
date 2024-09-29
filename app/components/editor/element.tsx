import { RenderElementProps } from "slate-react";

export function Element({ attributes, children, element }: RenderElementProps) {
  switch (element.type) {
    case "code":
      return (
        <pre {...attributes}>
          <code>{children}</code>
        </pre>
      );
    case "bulleted-list":
      return (
        <ul {...attributes} className="list-disc pl-5 flex flex-col gap-1">
          {children}
        </ul>
      );
    case "numbered-list":
      return (
        <ol {...attributes} className="list-decimal pl-5 flex flex-col gap-1">
          {children}
        </ol>
      );
    case "heading-1":
      return (
        <h1
          {...attributes}
          id={element.children[0].text}
          className="font-bold text-4xl py-3"
        >
          {children}
        </h1>
      );
    case "heading-2":
      return (
        <h2
          {...attributes}
          id={element.children[0].text}
          className="font-bold text-2xl"
        >
          {children}
        </h2>
      );
    case "heading-3":
      return (
        <h3
          {...attributes}
          id={element.children[0].text}
          className="font-bold text-xl"
        >
          {children}
        </h3>
      );
    case "heading-4":
      return <h4 {...attributes}>{children}</h4>;
    case "heading-5":
      return <h5 {...attributes}>{children}</h5>;
    case "heading-6":
      return <h6 {...attributes}>{children}</h6>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "link":
      return (
        <a {...attributes} href={element.url} className="text-[#a10005]">
          {children}
        </a>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
}
