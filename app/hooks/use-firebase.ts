import {
  FirebaseApp,
  FirebaseOptions,
  getApp,
  getApps,
  initializeApp,
} from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export function useFirebase(config: FirebaseOptions) {
  let app: FirebaseApp;
  if (getApps().length) {
    app = getApp();
  } else {
    app = initializeApp(config);
  }
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  return { app, db, storage, auth };
}
