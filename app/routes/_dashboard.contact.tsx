import { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [{ title: "Contact | FELESVLINDER" }];
};

export default function Contact() {
  return "Contact";
}
