import { ChangeEvent, ReactElement, useState } from "react";

export function useList(list: string[]) {
const [listItem, setListItem] = useState<string>("");

const listItemHandler = (e:ChangeEvent) => {
    setListItem((e.target as HTMLInputElement).value);
}

  const addOn = () => {
    list.push(listItem);
  };

  const deleteFrom = () => {
    list.splice(list.indexOf(listItem), 1);
  };

  const resetInput = () => {
    setListItem("");
  }


  return {
    listItem,
    setListItem,
    addOn,
    deleteFrom,
    listItemHandler,
    resetInput
};
}