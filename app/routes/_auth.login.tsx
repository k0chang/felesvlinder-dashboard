import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { auth } from "~/lib/firebase/firebase";

export default function Login() {
  //  const nav = useNavigate();
  return (
    <>
      <h1>ログインして♡</h1>
      <form method="post" className="flex flex-col gap-3 mt-6">
        <Input type="email" name="email" placeholder="email" />
        <Input type="password" name="password" placeholder="password" />
        <Button>ログイン</Button>
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

  await signInWithEmailAndPassword(auth, email, password);

  return redirect("/");
}
