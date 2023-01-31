import { type AppType } from "next/app";
import { api } from "../utils/api";
import GlobalContext from "../Components/GlobalContext";

import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <GlobalContext.Provider value={{}}>
      <Component {...pageProps} />
    </GlobalContext.Provider>
  );
};

export default api.withTRPC(MyApp);
