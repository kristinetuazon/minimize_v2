import React from "react";
import { type Item } from "../types/global";

type Props = { deleteFrom: (id: string) => void; list: Item[] };

const ListComponent = ({ deleteFrom, list }: Props) => {
  return (
    <div className="mt-5 max-h-[200px] w-full overflow-y-auto rounded-md border-2 bg-fadedPink p-3">
      <ul className="flex flex-col gap-1">
        {list.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 font-bodyRegular"
          >
            <span className="break-words">{item.name}</span>
            <button
              type="button"
              aria-label={`Remove ${item.name}`}
              onClick={() => deleteFrom(item.id)}
              className="h-10 w-10 shrink-0 rounded-full border-2 border-blackish bg-fadedPink text-2xl hover:bg-powder"
            >
              −
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListComponent;
