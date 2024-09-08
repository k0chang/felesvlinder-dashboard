import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { json, useActionData, useNavigation } from "@remix-run/react";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { auth } from "~/lib/firebase/firebase";

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  console.log(navigation.state);
  return (
    <>
      <h1>ログインして♡</h1>
      <form method="post" className="flex flex-col gap-3 mt-6">
        <Input type="email" name="email" placeholder="email" />
        <Input type="password" name="password" placeholder="password" />
        <Button disabled={navigation.state !== "idle"}>ログイン</Button>
        <p className="text-red-600 text-sm">{actionData?.error}</p>
      </form>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    throw new Error("Please enter email and password");
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    if (error instanceof FirebaseError) {
      console.error({ code: error.code });
      if (["auth/wrong-password", "auth/user-not-found"].includes(error.code)) {
        return json(
          { error: "メールアドレスまたはパスワードが間違っています" },
          { status: 400 }
        );
      }
      return json({ error: "何かしらのエラーが起きました" }, { status: 400 });
    }
  }

  return redirect("/");
}
