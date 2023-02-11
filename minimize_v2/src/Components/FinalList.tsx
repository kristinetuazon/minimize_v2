import React from "react";
import FinalListItem from "./FinalListItem";
import { type Item } from "../types/global";
//import GlobalContext from './GlobalContext'

type Props = { list: Item[], listName: string};

const FinalList = (props: Props) => {
  const { list, listName } = props;

  return (
    <div className="mt-5  min-w-[250px] min-h-[200px] max-h-[400px] overflow-y-scroll w-full rounded-md border-2 bg-supple p-10">
      <h1 className="font-title uppercase text-right text-5xl md:text-4xl mb-4" >{listName}</h1>
    <ul className = "items-center">
      <FinalListItem list={list} />
    </ul>
    </div>
  );
};

export default FinalList;
