import React, { useContext, useState, useRef } from "react";
import GlobalContext from "./GlobalContext";
import dynamic from "next/dynamic";
import Container from "./Container";
import { type Item } from "../types/global";
import { GlobalContextType } from "../types/global";
import BottomBar from "./BottomBar";

const TinderCard = dynamic(
  () => {
    return import("react-tinder-card");
  },
  { ssr: false }
);

const TinderCards = () => {
  const contextValue = useContext<GlobalContextType>(GlobalContext);
  const {
    // localStorage,
    LISTOBJECT,
    yesList,
    noList,
    maybeList,
    setYesList,
    setNoList,
    setMaybeList,
  } = contextValue;
  const [currentIndex, setCurrentIndex] = useState<number>(
    LISTOBJECT!.listOfItems.length - 1
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
      setNoList!([...noList!, { id: id, name: nameToDelete }]);
    }
    if (direction === "right") {
      setYesList!([...yesList!, { id: id, name: nameToDelete }]);
    }
    // if (direction === "down") {
    //   setMaybeList!([...maybeList!, { id: id, name: nameToDelete }]);
    // }
    setLastDirection(direction);
    updateCurrentIndex(index - 1);
  };

  const renderCards = LISTOBJECT!.listOfItems.map((item: Item, index: number) => {
    return (
      <TinderCard
        className="swipe absolute"
        key={item.id}
        preventSwipe={["up"]}
        onSwipe={(dir) => swiped(dir, item.name, index, item.id)}
      >
        <div className="h-600 w-400 bg-supple flexCenter border-2 border-blackish rounded-2xl ">
          <h2 className="text-blackish self-center uppercase font-title text-4xl p-20" >{item.name}</h2>
          <p className="w-full text-center font-bodyRegular text-blackish pb-20">
            Does this give you joy? ✨
          </p>
          {/* {item.picture? 
         <img src={`data:image/png;base64,${item.picture}`} alt="" />: ""
         }  */}
        </div>
      </TinderCard>
    );
  });

  return ( <>{renderCards}
  <BottomBar/></>)
};

export default TinderCards;
