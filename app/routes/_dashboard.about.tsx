import { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [{ title: "About | FELESVLINDER" }];
};

export default function About() {
  return "About";
}
