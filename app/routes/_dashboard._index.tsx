import { MetaFunction, redirect } from "@remix-run/react";
import { auth } from "~/lib/firebase";

export const meta: MetaFunction = () => {
  return [
    { title: "ダッシュボード | FELESVLINDER" },
    { name: "description", content: "管理画面のホームだよ" },
  ];
};

export async function loader() {
  const user = auth.currentUser;
  if (!user) {
    return redirect("/sign-in");
  }
  return redirect("/gallery");
}
