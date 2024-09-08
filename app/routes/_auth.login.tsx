import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  return json({ message: request.url });
}

export default function Login() {
  const data = useLoaderData();
  return (
    <>
      <h1>Login</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {}
