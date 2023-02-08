export type Item = {
  id: string;
  name: string;
  picture?: string;
};

export type List = {
  id: string;
  listName: string;
  description: string;
  listOfItems: Item[];
};
