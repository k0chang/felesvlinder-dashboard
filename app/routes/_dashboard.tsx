import {
  json,
  Link,
  Outlet,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { useFirebase } from "~/hooks/use-firebase";
import { firebaseConfig } from "~/lib/firebase";

export async function loader() {
  return json({ firebaseConfig });
}

export default function Layout() {
  const { firebaseConfig } = useLoaderData<typeof loader>();
  const { auth } = useFirebase(firebaseConfig);

  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/sign-in");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

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
        <Button
          variant={"secondary"}
          type="button"
          onClick={() => auth.signOut()}
        >
          ログアウト
        </Button>
      </div>

      <div className={"relative m-[30px_50px] grow"}>
        <Outlet />
      </div>
    </div>
  );
}
