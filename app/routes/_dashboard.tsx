import { Link, NavLink, Outlet, useNavigate } from "@remix-run/react";
import { getAuth } from "firebase/auth";
import { PowerOff } from "lucide-react";
import { AuthProvider } from "~/components/layout/auth-provider";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export default function Layout() {
  const auth = getAuth();
  const navigate = useNavigate();
  return (
    <AuthProvider>
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
          <div className="h-10 flex items-center gap-8">
            <Link
              title="Visit public site"
              to={"https://felesvlinder.com"}
              target="_blank"
              rel="noreferrer"
              className="size-7 relative [&>#overlay]:bg-transparent [&>#overlay]:hover:bg-white [&>#overlay]:transition-colors"
            >
              <div id="overlay" className="absolute size-full" />
              <img
                src="/public-tonan.jpg"
                alt="public site link"
                className="object-cover size-full mix-blend-difference"
              />
            </Link>
            <Button
              title="Sign out"
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
        </div>

        <div className={"m-[30px_50px] grow"}>
          <Outlet />
        </div>
      </div>
    </AuthProvider>
  );
}
