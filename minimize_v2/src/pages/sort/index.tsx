import React, {useContext} from "react";
import GlobalContext from "../../Components/GlobalContext";

type Props = {};

const Sort = (props: Props) => {
  const contextValue = useContext(GlobalContext);
  const {} = contextValue;
  return (
    <>
      <main className="w-screen bg-fadedPink">
       <div className="flexCenter h-screen w-screen">

       </div>
      </main>
    </>
  );
};

export default Sort;
