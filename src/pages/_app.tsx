import { type AppType } from "next/app";
import { GlobalProvider } from "../Components/GlobalContext";
import NavBar from "../Components/NavBar";
import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <GlobalProvider>
      <NavBar />
      <Component {...pageProps} />
    </GlobalProvider>
  );
};

export default MyApp;
