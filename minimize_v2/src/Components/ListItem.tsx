// import { useContext, useState, useEffect } from "react";
import React from "react";
import type { Item } from "../types/global";

type Props = { deleteFrom?: (id: string) => void; list: Item[] };

const ListItem = (props: Props) => {
  const { deleteFrom, list } = props;

  const mapList = list.map((item: Item, index: number) => {
    return (
      <li className="font-bodyRegular" key={index} id={item.id}>
        <div className="mt-1 grid grid-cols-2 place-items-center">
          <p className="item-name">{item.name}</p>
          {deleteFrom? <button
            onClick={() => {
              deleteFrom(item.id);
            }}
            className="ml-5 rounded-full border-2 border-blackish bg-fadedPink p-2 hover:bg-powder"
          >
            <p className="font-body text-2xl"> - </p>
          </button>: ""}
        </div>
      </li>
    );
  });

  return <>{list.length > 0 ? mapList : ""}</>;
};

export default ListItem;
