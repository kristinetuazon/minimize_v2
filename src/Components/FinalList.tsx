import React from "react";
import { type Item } from "../types/global";

type Props = { list: Item[]; listName: string };

const FinalList = ({ list, listName }: Props) => {
  return (
    <div className="mt-5 max-h-[400px] min-h-[200px] w-[90vw] max-w-[300px] overflow-y-auto rounded-md border-2 bg-supple p-10">
      <h2 className="mb-4 text-right font-title text-4xl uppercase md:text-5xl">
        {listName}
      </h2>
      {list.length > 0 ? (
        <ul>
          {list.map((item) => (
            <li
              key={item.id}
              className="mb-1 flex items-center font-bodyRegular"
            >
              <span aria-hidden>▫️</span>
              <span className="ml-2">{item.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center font-bodyRegular opacity-70">Nothing here.</p>
      )}
    </div>
  );
};

export default FinalList;
