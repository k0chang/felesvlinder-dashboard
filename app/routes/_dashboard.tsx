import { Outlet } from "@remix-run/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { SignOutButton } from "~/components/button/sign-out";
import { AuthProvider } from "~/components/layout/auth-provider";
import { PublicSiteLink } from "~/components/layout/links";
import { Navigation } from "~/components/layout/navigation";
import { SideBar } from "~/components/layout/sidebar";
import { Button } from "~/components/ui/button";

export const pages = [
  {
    title: "GALLERY",
    to: "/gallery",
  },
  {
    title: "ABOUT",
    to: "/about",
  },
  {
    title: "CONTACT",
    to: "/contact",
  },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <div className={"min-h-screen flex grow flex-col bg-[#f1f1f1]"}>
        <div
          className={
            "flex flex-row-reverse sm:flex-row items-center justify-between bg-black p-2 text-white sticky top-0 z-10 drop-shadow-[0_4px_8px_rgba(0,0,0,0.598)] border-b-[#521416] border-b-2"
          }
        >
          <div className={"ml-2 hidden sm:block"}>
            <Navigation pages={pages} />
          </div>

          <div className="h-10 sm:flex items-center gap-8 hidden">
            <PublicSiteLink />
            <SignOutButton />
          </div>

          <div className={"flex sm:hidden gap-4 items-center justify-center"}>
            <Button
              variant={"ghost"}
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="hover:bg-inherit"
            >
              <ChevronDown size={24} strokeLinecap="square" />
            </Button>
          </div>
        </div>

        <div className={"mx-0 my-4 sm:m-[30px_50px] grow"}>
          <Outlet />
        </div>
      </div>

      <SideBar open={sidebarOpen} onOpenChange={setSidebarOpen} />
    </AuthProvider>
  );
}
