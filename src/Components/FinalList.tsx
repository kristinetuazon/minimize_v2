import React from "react";
import FinalListItem from "./FinalListItem";
import { type Item } from "../types/global";
//import GlobalContext from './GlobalContext'

type Props = { list: Item[]; listName: string };

const FinalList = (props: Props) => {
  const { list, listName } = props;

  return (
    <div className="mt-5  max-h-[400px] min-h-[200px] w-full min-w-[250px] overflow-y-scroll rounded-md border-2 bg-supple p-10">
      <h1 className="mb-4 text-right font-title text-5xl uppercase md:text-4xl">
        {listName}
      </h1>
      <ul className="items-center">
        <FinalListItem list={list} />
      </ul>
    </div>
  );
};

export default FinalList;
