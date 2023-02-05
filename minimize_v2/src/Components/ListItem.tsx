import { useContext, useState, useEffect } from "react";
import React from "react";
import GlobalContext from "./GlobalContext";
import type { Item } from "../types/global";

type Props = {};

const ListItem = (props: Props) => {
  const value = useContext(GlobalContext);
  let { list } = value;
  const [ listCopy, setListCopy ] = useState<Item[]>([])
  const [selectedItem, setSelectedItem] = useState<string>("");

  useEffect (() => {
    setListCopy(list);
  }, [])

  console.log(list, listCopy)

  function deleteFrom(id: string) {
    console.log(id, "🍟")
    return setListCopy(list.filter((item:Item) => item.id !== id))
  }

  const mapList = listCopy.map((item: Item, index: number) => {
    return (
      <li className="font-bodyRegular" key={index} id={item.id}>
        <div className="mt-1 grid grid-cols-2 place-items-center">
          <p className="item-name">{item.name}</p>
          <button onClick={()=>{deleteFrom(item.id)}} className="ml-5 rounded-full border-2 border-blackish bg-fadedPink p-2 hover:bg-powder">
            <p className="font-body text-2xl"> - </p>
          </button>
        </div>
      </li>
    );
  });

  return <>{listCopy.length>0? mapList:"" }</>;
};

export default ListItem;
