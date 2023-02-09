import React, { useContext } from "react";
import GlobalContext from "../Components/GlobalContext";
import dynamic from "next/dynamic";
import Container from "../Components/Container";
import { type Item } from "../types/global";

const TinderCard = dynamic(
  () => {
    return import("react-tinder-card");
  },
  { ssr: false }
);

type Props = {};

const TinderCards = (props: Props) => {
  const contextValue = useContext(GlobalContext);
  const {
    localStorage,
    setLocalStorage,
    LISTOBJECT,
    yesList,
    noList,
    maybeList,
    setYesList,
    setNoList,
    setMaybeList,
  } = contextValue;

  console.log(localStorage.listOfItems, "🥘");
  return localStorage.listOfItems.map((item: Item) => {
    return (
      <TinderCard className="swipe" key={item.id} preventSwipe={["up"]}>
        <Container title={item.name}>
          <p className="w-full text-center font-bodyRegular">
            Does this give you joy?
          </p>
          {/* {item.picture &&
         <img src={item.picture} alt="" />
         }  */}
        </Container>
      </TinderCard>
    );
  });
};

export default TinderCards;
