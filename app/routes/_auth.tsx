import { Outlet } from "@remix-run/react";

export default function Layout() {
  return (
    <div className="border p-3">
      <h1>Auth Layout.</h1>
      <Outlet />
    </div>
  );
}
