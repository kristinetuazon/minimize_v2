import React from "react";
import Link from "next/link";

type Props = {
  children: string;
  page?: string;
  action?: () => void | Promise<string> | undefined;
};

export default function Button(props: Props) {
  const { children, page, action} = props;

  return (
    <button onClick={action}>
      <Link
        href={page? page:""} 
        id="link"
        className=" mt-10 border-2 bg-offWhite hover:bg-powder p-5 font-heading text-lg uppercase shadow-md"
      >
        {children}
      </Link>
    </button>
  );
}
