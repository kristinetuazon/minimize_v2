import { useState } from "react";

export function useList(list:string[]) {

console.log (list, "✨")
  const addOn = (listItem:string) => {
    console.log(listItem, "🧩")
    list.push(listItem);
    console.log(list, "🍟")
  };

  const deleteFrom = (selectedItem:string) => {
    list.splice(list.indexOf(selectedItem), 1);
  };



  return {
    list,
    addOn,
    deleteFrom,
};
}