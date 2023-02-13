import React from "react";
import type { Item } from "../types/global";
// import logo from "./../Assets/square-svgrepo-com.svg";
// import Image from "next/image";

type Props = { list: Item[] };

const FinalListItem = (props: Props) => {
  const { list } = props;

  const mapList = list.map((item: Item, index: number) => {
    return (
      <li className="mb-1 font-bodyRegular" key={index} id={item.id}>
        <div className="flex flex-row items-center ">
          <p>▫️</p>
          {/* <Image id="logo" alt="checkbox" src={logo} height={30} /> */}
          <p className="item-name ml-2">{item.name}</p>
        </div>
      </li>
    );
  });

  return <>{list.length > 0 ? mapList : ""}</>;
};

export default FinalListItem;
