import { resolveHref } from "next/dist/shared/lib/router/router";
import React from "react";
import Link from "next/link";

type Props = {
  children: string;
  page: string;
};

export default function Button(props: Props) {
  const { children, page } = props;

  return (
    <button>
      <Link
        href={page}
        id="link"
        className=" mt-10 border-2 bg-supple p-5 font-heading text-lg uppercase shadow-md"
      >
        {" "}
        {children}{" "}
      </Link>
    </button>
  );
}
