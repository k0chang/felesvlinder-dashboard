import { Outlet } from "@remix-run/react";

export async function loader() {
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
