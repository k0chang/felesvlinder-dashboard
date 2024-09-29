import { useNavigate } from "@remix-run/react";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { createContext, useEffect, useState } from "react";

const AuthContext = createContext<User | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        navigate("/sign-in");
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}
