import React from "react";
import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="absolute z-10">
      <Link href="/" className="m-7 block font-title text-6xl">
        MNMZ
      </Link>
    </nav>
  );
}
