import React from "react";

type Props = {
  children?: React.ReactNode;
  title?: string;
};

export default function Container({ children, title }: Props) {
  return (
    <div className="w-[90vw] max-w-[450px] border-2 bg-supple p-10">
      {title ? (
        <h2 className="mb-6 break-words text-right font-title text-4xl uppercase md:text-5xl">
          {title}
        </h2>
      ) : null}
      {children}
    </div>
  );
}
