import { ActionFunctionArgs, redirect, TypedResponse } from "@remix-run/node";
import { Form, json, useActionData, useNavigation } from "@remix-run/react";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { auth } from "~/lib/firebase/firebase";

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  return (
    <>
      <h1>ログインして♡</h1>
      <Form method="post" className="flex flex-col gap-3 mt-6">
        <Input type="email" name="email" placeholder="email" />
        <p className="text-red-600 text-sm">{actionData?.errors.email}</p>
        <Input type="password" name="password" placeholder="password" />
        <p className="text-red-600 text-sm">{actionData?.errors.password}</p>
        <Button disabled={navigation.state !== "idle"}>ログイン</Button>
        <p className="text-red-600 text-sm">{actionData?.errors.root}</p>
      </Form>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs): Promise<
  TypedResponse<{
    errors: {
      root?: string;
      email?: string;
      password?: string;
    };
  }>
> {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || !email.length) {
    return json({ errors: { email: "メールアドレスを入力" } }, { status: 400 });
  }
  if (typeof password !== "string" || !password.length) {
    return json({ errors: { password: "パスワードを入力" } }, { status: 400 });
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    if (error instanceof FirebaseError) {
      console.error({ code: error.code });
      if (["auth/wrong-password", "auth/user-not-found"].includes(error.code)) {
        return json(
          {
            errors: { root: "メールアドレスまたはパスワードが間違っています" },
          },
          { status: 400 }
        );
      }
      return json(
        { errors: { root: "何かしらのエラーが起きました" } },
        { status: 400 }
      );
    }
  }

  return redirect("/");
}
