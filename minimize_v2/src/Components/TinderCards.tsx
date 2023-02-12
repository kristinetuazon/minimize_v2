import React, { useContext, useState, useRef } from "react";
import GlobalContext from "./GlobalContext";
import dynamic from "next/dynamic";
import Container from "./Container";
import { type Item } from "../types/global";
import { GlobalContextType } from "../types/global";

const TinderCard = dynamic(
  () => {
    return import("react-tinder-card");
  },
  { ssr: false }
);

const TinderCards = () => {
  const contextValue = useContext<GlobalContextType>(GlobalContext);
  const {
    localStorage,
    yesList,
    noList,
    maybeList,
    setYesList,
    setNoList,
    setMaybeList,
  } = contextValue;
  const [currentIndex, setCurrentIndex] = useState<number>(
    localStorage!.listOfItems.length - 1
  );
  const [lastDirection, setLastDirection] = useState<string>("");
  const currentIndexRef = useRef<number>(currentIndex);

  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const swiped = (
    direction: string,
    nameToDelete: string,
    index: number,
    id: string
  ) => {
    if (direction === "left") {
      noList!.push({ id: id, name: nameToDelete });
    }
    if (direction === "right") {
      yesList!.push({ id: id, name: nameToDelete });
    }
    if (direction === "down") {
      maybeList!.push({ id: id, name: nameToDelete });
    }
    setLastDirection(direction);
    updateCurrentIndex(index - 1);
  };


const renderTinderCards =localStorage!.listOfItems.map((item: Item, index: number) => {
    return <>
      <TinderCard
        className="swipe absolute"
        key={item.id}
        preventSwipe={["up"]}
        onSwipe={(dir) => swiped(dir, item.name, index, item.id)}
      >
        <Container title={item.name}>
          <p className="w-full text-center font-bodyRegular">
            Does this give you joy? ✨
          </p>
          {/* {item.picture? 
         <img src={`data:image/png;base64,${item.picture}`} alt="" />: ""
         }  */}
        </Container>
      </TinderCard>
      </>
  });

  return(<>
  {renderTinderCards}
  </>)
};

export default TinderCards;
