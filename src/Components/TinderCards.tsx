import React, {
  useMemo,
  type RefObject,
  useContext,
  useState,
  useRef,
} from "react";
import GlobalContext from "./GlobalContext";
import dynamic from "next/dynamic";
import { type Item } from "../types/global";
import { GlobalContextType } from "../types/global";
import BottomBar from "./BottomBar";

type Direction = "left" | "right" | "up" | "down";

export interface API {
  swipe(dir?: Direction): Promise<void>;
  restoreCard(): Promise<void>;
}

const TinderCard = dynamic(
  () => {
    return import("react-tinder-card");
  },
  { ssr: false }
);

const TinderCards = () => {
  const contextValue = useContext<GlobalContextType>(GlobalContext);
  const { LISTOBJECT, yesList, noList, setYesList, setNoList } = contextValue;
  const [currentIndex, setCurrentIndex] = useState<number>(
    LISTOBJECT!.listOfItems.length - 1
  );
  const [lastDirection, setLastDirection] = useState<string>("");
  const currentIndexRef = useRef<number>(currentIndex);
  const tinderCardRef = useRef<RefObject<API>>(null);

  
  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  // const childRefs: RefObject<API>[] = useMemo(
  //   () =>
  //     Array(LISTOBJECT!.listOfItems.length)
  //       .fill(0)
  //       .map((i) => React.createRef()),
  //   []
  // );

  // const canGoBack = currentIndex < LISTOBJECT!.listOfItems.length - 1

  const canSwipe = currentIndex >= 0;

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

  // console.log(lastDirection);
  // console.log(currentIndex);

  // const swipe = async (direction: Direction) => {
  //   console.log("💕", canSwipe, childRefs, childRefs[currentIndex]);

  //   if (
  //     canSwipe &&
  //     currentIndex < LISTOBJECT!.listOfItems.length &&
  //     childRefs[currentIndex]!.current
  //   ) {
  //     await childRefs[currentIndex]!.current!.swipe(direction); // Swipe the card!
  //   }
  // };



  const renderCards = LISTOBJECT!.listOfItems.map(
    (item: Item, index: number) => {
      return (
        <TinderCard
          className="swipe absolute"
          key={item.id}
          preventSwipe={["up"]}
          onSwipe={(dir) => swiped(dir, item.name, index, item.id)}
          onKeyDown={(e: React.KeyboardEvent<HTMLImageElement>) => {
            console.log(e.code)
            if (e.code === "ArrowLeft") {
              swiped("left", item.name, index, item.id)
              console.log("left", item.name, index, item.id)
            }
          if (e.code ==="ArrowRight") {
            swiped("right", item.name, index, item.id)
            console.log("right", item.name, index, item.id)
          }}}
          // onCardLeftScreen={() => outOfFrame(character.name, index)}
        >
          <div
            id={item.id}
            className="h-600 w-400 flexCenter rounded-2xl border-2 border-blackish bg-supple "
          >
            <h2 className="self-center p-20 font-title text-4xl uppercase text-blackish">
              {item.name}
            </h2>
            <p className="w-full pb-20 text-center font-bodyRegular text-blackish">
              Does this give you joy? ✨
            </p>
            {/* {item.picture? 
         <img src={`data:image/png;base64,${item.picture}`} alt="" />: ""
         }  */}
          </div>
        </TinderCard>
      );
    }
  );

  return (
    <>
      {renderCards}
      {/* <BottomBar
        leftAction={() => {
          swipe("left");
        }}
        rightAction={() => {
          swipe("right");
        }}
      /> */}
    </>
  );
};

export default TinderCards;
