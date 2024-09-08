import { json, MetaFunction, redirect, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { auth } from "~/lib/firebase/firebase";

export const meta: MetaFunction = () => {
  return [
    { title: "ダッシュボード | FELESVLINDER" },
    { name: "description", content: "管理画面のホームだよ" },
  ];
};

export async function action() {
  await auth.signOut();
  return redirect("/login");
}

export async function loader() {
  const user = auth.currentUser;
  if (!user) {
    return redirect("/login");
  }
  return json({ user: { email: user.email } });
}

export default function DashboardHome() {
  const data = useLoaderData<{ user: { email: string } }>();
  return (
    <>
      <h1>Dashboard home</h1>
      <p>User: {data.user.email}</p>
      <form action="/?index" method="post">
        <Button>ログアウト</Button>
      </form>
    </>
  );
}
