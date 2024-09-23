import { Link, Outlet } from "@remix-run/react";
import { Button } from "~/components/ui/button";

export default function Layout() {
  return (
    <div className={"flex grow flex-col bg-[#f1f1f1]"}>
      <div
        className={"flex items-center justify-between bg-black p-2 text-white"}
      >
        <div className={"ml-2 flex gap-6"}>
          <Link to={"/gallery"}>GALLERY</Link>
          <Link to={"/about"}>ABOUT</Link>
          <Link to={"/contact"}>CONTACT</Link>
        </div>
        <form action="/sign-out" method="post">
          <Button variant={"secondary"}>ログアウト</Button>
        </form>
      </div>

      <div className={"relative m-[30px_50px] grow"}>
        <Outlet />
      </div>
    </div>
  );
}
