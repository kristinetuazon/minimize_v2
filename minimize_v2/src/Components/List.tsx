import React from "react";
import ListItem from "../Components/ListItem";
import { type Item } from "../types/global";
//import GlobalContext from './GlobalContext'

type Props = { deleteFrom?: (id: string) => void; list: Item[] };

const ListComponent = (props: Props) => {
  const { deleteFrom, list } = props;

  return (
    <div className="flexCenter mt-5 max-h-[200px] w-full overflow-scroll rounded-md border-2 bg-fadedPink p-3">
      <ul className="flexCenter items-center">
        <ListItem deleteFrom={deleteFrom} list={list} />
      </ul>
    </div>
  );
};

export default ListComponent;
