import { Link, Outlet, redirect, useNavigate } from "@remix-run/react";
import { getAuth } from "firebase/auth";
import { Button } from "~/components/ui/button";

export async function clientLoader() {
  const auth = getAuth();
  if (!auth.currentUser) {
    return redirect("/sign-in");
  }
  return null;
}

export default function Layout() {
  const auth = getAuth();
  const navigate = useNavigate();
  return (
    <div className={"min-h-full flex grow flex-col bg-[#f1f1f1]"}>
      <div
        className={"flex items-center justify-between bg-black p-2 text-white"}
      >
        <div className={"ml-2 flex gap-6"}>
          <Link to={"/gallery"}>GALLERY</Link>
          <Link to={"/about"}>ABOUT</Link>
          <Link to={"/contact"}>CONTACT</Link>
        </div>
        <Button
          variant={"secondary"}
          type="button"
          onClick={async () => {
            await auth.signOut();
            navigate("/sign-in");
          }}
        >
          ログアウト
        </Button>
      </div>

      <div className={"m-[30px_50px] grow"}>
        <Outlet />
      </div>
    </div>
  );
}
