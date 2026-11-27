import React from "react";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
  /** Navigate here when clicked. */
  page?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

const base =
  "mt-10 inline-block border-2 bg-offWhite p-5 font-heading text-lg uppercase shadow-md";

export default function Button({
  children,
  page,
  onClick,
  disabled,
  className = "",
}: Props) {
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className={`${base} cursor-not-allowed opacity-50 ${className}`}
      >
        {children}
      </button>
    );
  }

  const classes = `${base} hover:bg-powder ${className}`;

  if (page) {
    return (
      <Link href={page} onClick={onClick} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
