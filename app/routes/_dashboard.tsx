import { NavLink, Outlet, redirect, useNavigate } from "@remix-run/react";
import { getAuth } from "firebase/auth";
import { PowerOff } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

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
    <div className={"min-h-screen flex grow flex-col bg-[#f1f1f1]"}>
      <div
        className={
          "flex items-center justify-between bg-black p-2 text-white sticky top-0 z-10 drop-shadow-[0_4px_8px_rgba(0,0,0,0.598)] border-b-[#521416] border-b-2"
        }
      >
        <div className={"ml-2 flex gap-6"}>
          <NavLink
            to={"/gallery"}
            className={({ isActive }) =>
              cn(
                "hover:text-[#521416] transition-colors",
                isActive && "text-[#521416]"
              )
            }
          >
            GALLERY
          </NavLink>
          <NavLink
            to={"/about"}
            className={({ isActive }) =>
              cn(
                "hover:text-[#521416] transition-colors",
                isActive && "text-[#521416]"
              )
            }
          >
            ABOUT
          </NavLink>
          <NavLink
            to={"/contact"}
            className={({ isActive }) =>
              cn(
                "hover:text-[#521416] transition-colors",
                isActive && "text-[#521416]"
              )
            }
          >
            CONTACT
          </NavLink>
        </div>
        <Button
          variant={"ghost"}
          type="button"
          onClick={async () => {
            await auth.signOut();
            navigate("/sign-in");
          }}
          className="p-0 h-9 w-9 border border-white rounded-full hover:rounded-full hover:bg-transparent hover:border-red-500 [&_.lucide-power-off]:hover:text-red-500 [&_.lucide-power-off]:transition-colors [&_.lucide-power-off]:duration-100"
        >
          <PowerOff size={16} />
        </Button>
      </div>

      <div className={"m-[30px_50px] grow"}>
        <Outlet />
      </div>
    </div>
  );
}
