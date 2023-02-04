import { useState } from "react";
import { type Item } from "../../types/global";

export function useList(list:Item[]) {

console.log (list, "✨")
  const addOn = (listItem:Item) => {
    console.log(listItem, "🧩")
    list.push(listItem);
    console.log(list, "🍟")
  };

  const deleteFrom = (selectedItem:Item) => {
    list.splice(list.indexOf(selectedItem), 1);
  };



  return {
    list,
    addOn,
    deleteFrom,
};
}