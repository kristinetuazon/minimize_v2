import { ChangeEvent, useState } from "react";

export function useList(list: string[]) {
const [listItem, setListItem] = useState<string>("");
const [selectedItem, setSelectedItem] = useState<string>("");

const listItemHandler = (e:ChangeEvent) => {
    setListItem((e.target as HTMLInputElement).value);
}

  const addOn = () => {
    list.push(listItem);
  };

  const deleteFrom = () => {
    list.splice(list.indexOf(selectedItem), 1);
  };

  const resetInput = () => {
    setListItem("");
  }


  return {
    listItem,
    selectedItem,
    setSelectedItem,
    setListItem,
    addOn,
    deleteFrom,
    listItemHandler,
    resetInput
};
}