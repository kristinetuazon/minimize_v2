import { type AppType } from "next/app";
import { api } from "../utils/api";
import GlobalContext from "../Components/GlobalContext";
import { useList } from "../Components/Hooks/useList";
import "../styles/globals.css";
import { useState } from "react";

const MyApp: AppType = ({ Component, pageProps }) => {
  const { selectedItem, setSelectedItem, addOn, deleteFrom, list} = useList([]);
  const [listName, setListName] = useState<string>("");
  const [listDescription, setListDescription] = useState<string>("");


  return (
    <GlobalContext.Provider value={{
      //fromHook
      list: list,
      // listItem: listItem,
      selectedItem: selectedItem,
      setSelectedItem: setSelectedItem,
      // setListItem: setListItem,
      addOn: addOn,
      deleteFrom: deleteFrom,
      // resetInput: resetInput,
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
