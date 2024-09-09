import { redirect } from "@remix-run/react";
import { auth } from "~/lib/firebase";

export async function loader() {
  return redirect("/");
}

export async function action() {
  await auth.signOut();
  return redirect("/login");
}
