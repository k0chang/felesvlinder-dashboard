import { MetaFunction, useNavigate } from "@remix-run/react";
import { getAuth } from "firebase/auth";
import { useEffect } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "ダッシュボード | FELESVLINDER" },
    { name: "description", content: "管理画面のホームだよ" },
  ];
};

export default function Dashboard() {
  const auth = getAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/sign-in");
    }
    navigate("/gallery");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
