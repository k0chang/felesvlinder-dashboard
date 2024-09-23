import {
  json,
  MetaFunction,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { useEffect } from "react";
import { useFirebase } from "~/hooks/use-firebase";
import { firebaseConfig } from "~/lib/firebase";

export const meta: MetaFunction = () => {
  return [
    { title: "ダッシュボード | FELESVLINDER" },
    { name: "description", content: "管理画面のホームだよ" },
  ];
};

export async function loader() {
  return json({ firebaseConfig });
}

export default function Dashboard() {
  const { firebaseConfig } = useLoaderData<typeof loader>();
  const { auth } = useFirebase(firebaseConfig);

  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/sign-in");
    }
    navigate("/gallery");
  }, [auth.currentUser, navigate]);

  return null;
}
