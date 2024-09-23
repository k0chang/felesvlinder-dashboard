import {
  FirebaseApp,
  FirebaseOptions,
  getApp,
  getApps,
  initializeApp,
} from "firebase/app";
import { getAuth, User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { useEffect, useState } from "react";

export function useFirebase(config: FirebaseOptions) {
  const [user, setUser] = useState<User | null>(null);

  let app: FirebaseApp;
  if (getApps().length) {
    app = getApp();
  } else {
    app = initializeApp(config);
  }
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  return { app, db, storage, auth, user };
}
