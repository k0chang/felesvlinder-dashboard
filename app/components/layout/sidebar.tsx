import { ChevronUp } from "lucide-react";
import { cn } from "~/lib/utils";
import { pages } from "~/routes/_dashboard";
import { SignOutButton } from "../button/sign-out";
import { PublicSiteLink } from "./links";
import { Navigation } from "./navigation";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SideBar({ open, onOpenChange }: Props) {
  return (
    <div
      className={cn(
        "text-white fixed justify-center items-center inset-0 w-screen h-screen z-30 sm:hidden",
        open && "flex",
        !open && "hidden"
      )}
    >
      <div className="absolute backdrop-blur-sm w-full h-full inset-0" />
      <div
        className={cn(
          "absolute flex flex-col justify-between w-[calc(100%-20px)] h-[calc(100%-20px)] bg-black/[95%]",
          open ? "animate-slide-in-up-to-down" : "animate-slide-out-down-to-up"
        )}
      >
        <div className="mt-10 p-5 text-center text-lg">
          <Navigation pages={pages} onLinkClick={() => onOpenChange(false)} />
        </div>
        <div className="flex flex-col gap-8 items-center">
          <PublicSiteLink />
          <SignOutButton />
          <button
            onClick={() => onOpenChange(false)}
            className="flex justify-center p-3"
          >
            <ChevronUp size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}
