// import { useContext, useState, useEffect } from "react";
import React from "react";
import type { Item } from "../types/global";
import logo from "/public/square-svgrepo-com.svg";
import Image from "next/image";

type Props = { list: Item[] };

const FinalListItem = (props: Props) => {
  const { list } = props;

  const mapList = list.map((item: Item, index: number) => {
    return (
      <li className="font-bodyRegular mb-1" key={index} id={item.id}>
        <div className="flex flex-row items-center ">
          <Image
          id="logo"
          alt="checkbox"
          src={logo}
          height="30"
        /><p className="ml-2 item-name">{item.name}</p></div>
      </li>
    );
  });

  return <>{list.length > 0 ? mapList : ""}</>;
};

export default FinalListItem;
