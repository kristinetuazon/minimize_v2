import { type Item } from "../../types/global";

export function useList(list:Item[]) {

  const addOn = (listItem:Item) => {
    list.push(listItem);
  };



  return {
    list,
    addOn,
    // deleteFrom
};
}