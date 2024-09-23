import { json, Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { useFirebase } from "~/hooks/use-firebase";
import { firebaseConfig } from "~/lib/firebase";

export async function loader() {
  return json({ firebaseConfig });
}

// 認証系共通のレイアウト
export default function Layout() {
  const { firebaseConfig } = useLoaderData<typeof loader>();
  const { auth } = useFirebase(firebaseConfig);

  const navigate = useNavigate();

  useEffect(() => {
    if (auth.currentUser) {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.currentUser]);

  return (
    <div className="flex justify-center items-center py-7">
      <div className="w-56 mx-auto">
        <Outlet />
      </div>
    </div>
  );
}
