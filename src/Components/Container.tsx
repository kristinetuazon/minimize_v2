import React from "react";

type Props = {
  children?: JSX.Element | JSX.Element[] | string;
  title?: string;
};

export default function Box({ children, title }: Props) {
  return (
    <div className="border-1 min-w-[90-vw] max-w-[450px] border-2 bg-supple p-10 ">
      <h1 className="text-right font-title text-5xl uppercase md:text-4xl">
        {title}
      </h1>
      <br />
      {children}
    </div>
  );
}
