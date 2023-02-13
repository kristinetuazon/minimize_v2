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
  yesList?: Item[];
  noList?: Item[];
  maybeList?: Item[];
};

export type GlobalContextType = {
  //Hook States
  // localStorage?: List | undefined;
  // setLocalStorage?: (List) => void;
  //App Level States
  LISTOBJECT?: List;
  list?: Item[];
  setList?: (value: Item[]) => void;
  listName?: string;
  setListName?: (value:string) => void;
  listDescription?: string;
  setListDescription?: (value:string) => void;
  yesList?: Item[];
  noList?: Item[];
  maybeList?: Item[];
  setYesList?: (value: Item[]) => void;
  setNoList?: (value: Item[]) => void;
  setMaybeList?: (value: Item[]) => void;
};
