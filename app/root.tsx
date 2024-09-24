import { Outlet, Scripts } from "@remix-run/react";
import { getApps, initializeApp } from "firebase/app";
import "./tailwind.css";

export async function clientLoader() {
  // init firebase
  if (!getApps().length) {
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
    initializeApp(config);
  }
  return null;
}

export function HydrateFallback() {
  return (
    <>
      <Scripts />
    </>
  );
}

export default function App() {
  return (
    <>
      <Scripts />
      <Outlet />
    </>
  );
}
