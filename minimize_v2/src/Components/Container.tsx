import React from 'react';

type Props = {
    children?: JSX.Element | JSX.Element[]| string ;
    title?: string;
}

export default function Box({children, title}: Props) {
  return (
    <div className="bg-supple border-1 p-10 border-2 min-w-[300px] max-w-[450px] max-h-[70-vh]">
        <h1 className="font-title uppercase text-right text-5xl">{title}</h1>
        <br/>
        {children}
    </div>
  )
}