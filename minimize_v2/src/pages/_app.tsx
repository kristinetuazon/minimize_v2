import { type AppType } from "next/app";
import { api } from "../utils/api";
import GlobalContext from "../Components/GlobalContext";
import { useList } from "../Components/Hooks/useList";
import "../styles/globals.css";
import { useState } from "react";
import { type Item, type List } from "../types/global";
import { v4 as uuidv4 } from 'uuid';

const MyApp: AppType = ({ Component, pageProps }) => {
  const {  addOn, deleteFrom, list} = useList([]);
  const [listName, setListName] = useState<string>("");
  const [listDescription, setListDescription] = useState<string>("");

  const LISTOBJECT: List  = {
    id: uuidv4(),
    listName: listName,
    description: listDescription,
    listOfItems: list
  }


  return (
    <GlobalContext.Provider value={{
      //fromHook
      list: list,
      addOn: addOn,
      deleteFrom: deleteFrom,
      //App Level States
      listName: listName,
      setListName: setListName,
      listDescription: listDescription,
      setListDescription: setListDescription
    }}>
      <Component {...pageProps} />
    </GlobalContext.Provider>
  );
};

export default api.withTRPC(MyApp);
