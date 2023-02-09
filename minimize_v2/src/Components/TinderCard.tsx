import React, { useContext, useState, useMemo, useRef } from "react";
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
  const [currentIndex, setCurrentIndex] = useState<number>(localStorage.listOfItems.length - 1)
  const [lastDirection, setLastDirection] = useState<string>("")
  const currentIndexRef = useRef(currentIndex)

  const childRefs = useMemo(
    () =>
      Array(localStorage.listOfItems.length)
        .fill(0)
        .map((i) => React.createRef()),
    []
  )

  const updateCurrentIndex = (val:number) => {
    setCurrentIndex(val)
    currentIndexRef.current = val
  }

  const canGoBack = currentIndex < localStorage.listOfItems.length - 1

  const canSwipe = currentIndex >= 0

  const swiped = (direction:string, nameToDelete:string, index:number) => {
    setLastDirection(direction)
    updateCurrentIndex(index - 1)
  }

  const outOfFrame = (name:string, idx:number) => {
    console.log(`${name} (${idx}) left the screen!`, currentIndexRef.current)
    currentIndexRef.current >= idx && childRefs[idx].current.restoreCard()
  }

  const swipe = async (dir:string) => {
    if (canSwipe && currentIndex < localStorage.listOfItems.length) {
      await childRefs[currentIndex].current.swipe(dir) // Swipe the card!
    }
  }

  const goBack = async () => {
    if (!canGoBack) return
    const newIndex = currentIndex + 1
    updateCurrentIndex(newIndex)
    await childRefs[newIndex].current.restoreCard()
  }

  console.log(localStorage.listOfItems, "🥘");
  return localStorage.listOfItems.map((item: Item, index:number) => {
    return (
      <TinderCard className="swipe absolute" key={item.id} preventSwipe={["up"]}>
        <Container title={item.name}>
          <p className="w-full text-center font-bodyRegular">
            Does this give you joy? ✨
          </p>
          {/* {item.picture? 
         <img src={item.picture} alt="" />: ""
         }  */}
        </Container>
      </TinderCard>
    );
  });
};

export default TinderCards;
