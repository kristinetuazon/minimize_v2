import React, { useContext } from "react";
import GlobalContext from "../../Components/GlobalContext";
import TinderCard from "../../Components/TinderCard";
import Container from "../../Components/Container";

type Props = {};

const Sort = (props: Props) => {
  const contextValue = useContext(GlobalContext);
  const {} = contextValue;
  return (
    <>
      <main className="w-screen bg-fadedPink">
        <div className="flexCenter h-screen w-screen">
          <Container title={"Step Two"}>
            This is the step when you'll have to make a decision: whether this object is 
          </Container>
          <TinderCard />
        </div>
      </main>
    </>
  );
};

export default Sort;
