import { type AppType } from "next/app";
import { api } from "../utils/api";
import GlobalContext from "../Components/GlobalContext";
import useLocalStorage from "../Components/Hooks/useLocalStorage";
import "../styles/globals.css";
import { useState } from "react";
import { type Item, type List } from "../types/global";
import { v4 as uuidv4 } from "uuid";
import NavBar from "../Components/NavBar";

const MyApp: AppType = ({ Component, pageProps }) => {
  const [list, setList] = useState<Item[]>([]);
  const [listName, setListName] = useState<string>("");
  const [listDescription, setListDescription] = useState<string>("");
  const [localStorage, setLocalStorage] = useLocalStorage("listObject", {});
  const [yesList, setYesList] = useState<Item[]>([]);
  const [noList, setNoList] = useState<Item[]>([]);
  const [maybeList, setMaybeList] = useState<Item[]>([]);

  const LISTOBJECT: List = {
    id: uuidv4(),
    listName: listName,
    description: listDescription,
    listOfItems: list,
    yesList: yesList,
    noList: noList,
    maybeList: maybeList,
  };

  return (
    <GlobalContext.Provider
      value={{
        //Hook States
        localStorage: localStorage,
        setLocalStorage: setLocalStorage,
        //App Level States
        LISTOBJECT: LISTOBJECT,
        list: list,
        setList: setList,
        listName: listName,
        setListName: setListName,
        listDescription: listDescription,
        setListDescription: setListDescription,
        yesList: yesList,
        noList: noList,
        maybeList: maybeList,
        setYesList: setYesList,
        setNoList: setNoList,
        setMaybeList: setMaybeList,
      }}
    >
      <NavBar />
      <Component {...pageProps} />
    </GlobalContext.Provider>
  );
};

export default api.withTRPC(MyApp);
