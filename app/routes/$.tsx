import { MetaFunction } from "@remix-run/react";

export const meta: MetaFunction = () => [{ title: "Not Found" }];

export default function Index() {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <p>Not Found.</p>
    </div>
  );
}
