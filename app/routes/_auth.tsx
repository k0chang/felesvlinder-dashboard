import { Outlet } from "@remix-run/react";

// ログイン前共通のレイアウト
export default function Layout() {
  return (
    <div className="h-screen flex justify-center items-center py-7">
      <div className="w-56 mx-auto">
        <Outlet />
      </div>
    </div>
  );
}
