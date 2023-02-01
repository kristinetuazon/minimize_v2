import { type AppType } from "next/app";
import { api } from "../utils/api";
import GlobalContext from "../Components/GlobalContext";
import { useList } from "../Components/Hooks/useList";
import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  const {listItem, setListItem, addOn, deleteFrom, listItemHandler, resetInput} = useList([]);
  return (
    <GlobalContext.Provider value={{
      listItem: listItem,
      setListItem: setListItem,
      addOn: addOn,
      deleteFrom: deleteFrom,
      listItemHandler: listItemHandler,
      resetInput: resetInput

    }}>
      <Component {...pageProps} />
    </GlobalContext.Provider>
  );
};

export default api.withTRPC(MyApp);
