import { NavLink } from "@remix-run/react";
import { useRef } from "react";
import { cn } from "~/lib/utils";

type Props = {
  pages: { title: string; to: string }[];
  onLinkClick?: () => void;
};

export function Navigation({ pages, onLinkClick }: Props) {
  const ref = useRef<HTMLElement>(null);
  return (
    <nav className="flex flex-col sm:flex-row gap-6" ref={ref}>
      {pages.map((p) => (
        <NavLink
          key={p.to}
          to={p.to}
          className={({ isActive }) =>
            cn(
              "hover:text-[#521416] transition-colors",
              isActive && "text-[#521416]"
            )
          }
          onClick={onLinkClick}
        >
          {p.title}
        </NavLink>
      ))}
    </nav>
  );
}
