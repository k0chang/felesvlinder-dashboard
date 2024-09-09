import { Outlet, redirect } from "@remix-run/react";
import { auth } from "~/lib/firebase";

export async function loader() {
  if (auth.currentUser) {
    return redirect("/");
  }
  return null;
}

// 認証系共通のレイアウト
export default function Layout() {
  return (
    <div className="flex justify-center items-center py-7">
      <div className="w-56 mx-auto">
        <Outlet />
      </div>
    </div>
  );
}
