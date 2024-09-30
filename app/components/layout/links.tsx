import { Link } from "@remix-run/react";

export function PublicSiteLink() {
  return (
    <Link
      title="Visit public site"
      to={"https://felesvlinder.com"}
      target="_blank"
      rel="noreferrer"
      className="size-7 relative [&>#overlay]:bg-transparent [&>#overlay]:hover:bg-white [&>#overlay]:transition-colors"
    >
      <div id="overlay" className="absolute size-full" />
      <img
        src="/public-tonan.jpg"
        alt="public site link"
        className="object-cover size-full mix-blend-difference"
      />
    </Link>
  );
}
