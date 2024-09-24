import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { getApps, initializeApp } from "firebase/app";
import { Toaster } from "./components/ui/toaster";
import { firebaseConfigFromEnv } from "./lib/firebase";
import "./tailwind.css";

export async function loader({ context }: LoaderFunctionArgs) {
  // init firebase
  if (!getApps().length) {
    initializeApp(firebaseConfigFromEnv(context.cloudflare.env));
  }
  return null;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja-JP">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <Toaster />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
