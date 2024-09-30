import { ComponentProps } from "react";

export function Heading({ children }: ComponentProps<"h1">) {
  return (
    <h1 className="font-bold text-3xl inline-flex gap-2 flex-wrap w-full justify-between items-center border-black border-b-[1px] pb-3 px-4 sm:px-0">
      {children}
    </h1>
  );
}
