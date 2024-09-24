import { Outlet, redirect } from "@remix-run/react";
import { getAuth } from "firebase/auth";

export async function clientLoader() {
  const auth = getAuth();
  if (auth.currentUser) {
    return redirect("/");
  }
  return null;
}

// 認証系共通のレイアウト
export default function Layout() {
  return (
    <div className="h-screen flex justify-center items-center py-7">
      <div className="w-56 mx-auto">
        <Outlet />
      </div>
    </div>
  );
}
