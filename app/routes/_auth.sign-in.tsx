import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { MetaFunction } from "@remix-run/cloudflare";
import {
  Form,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useFirebase } from "~/hooks/use-firebase";
import { firebaseConfig } from "~/lib/firebase";

const signInFormSchema = z.object({
  email: z
    .string({ required_error: "メールアドレスを入力" })
    .email({ message: "メールアドレスの形式が誤っています" }),
  password: z.string({ required_error: "パスワードを入力" }),
});

export const meta: MetaFunction = () => {
  return [{ title: "ログイン | FELESVLINDER" }];
};

export const loader = () => {
  return { firebaseConfig };
};

export default function SignIn() {
  const { firebaseConfig } = useLoaderData<typeof loader>();
  const { auth } = useFirebase(firebaseConfig);

  const navigation = useNavigation();
  const navigate = useNavigate();

  const [signInError, setSignInError] = useState<string | null>(null);
  const [form, field] = useForm({
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: signInFormSchema });
    },
    onSubmit: async (event, { formData }) => {
      event.preventDefault();
      const submission = parseWithZod(formData, { schema: signInFormSchema });
      if (submission.status !== "success") {
        return submission.reply();
      }
      const { email, password } = submission.value;
      try {
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/");
      } catch (error) {
        if (error instanceof FirebaseError) {
          if (
            ["auth/wrong-password", "auth/user-not-found"].includes(error.code)
          ) {
            setSignInError("メールアドレスまたはパスワードが間違っています");
            return;
          }
        }
        setSignInError("何かしらのエラーが起きました");
      }
    },
    shouldRevalidate: "onInput",
  });

  return (
    <>
      <h1 className="text-lg font-bold">ログインして♡</h1>
      <Form {...getFormProps(form)} className="flex flex-col gap-3 mt-6">
        <Input
          {...getInputProps(field.email, { type: "email" })}
          placeholder="email"
        />
        {field.email.errors && (
          <p className="text-red-600 text-sm">{field.email.errors[0]}</p>
        )}
        <Input
          {...getInputProps(field.password, { type: "password" })}
          placeholder="password"
        />
        {field.password.errors && (
          <p className="text-red-600 text-sm">{field.password.errors[0]}</p>
        )}
        <Button disabled={navigation.state !== "idle"}>ログイン</Button>
        <p className="text-red-600 text-sm">{signInError}</p>
      </Form>
    </>
  );
}
