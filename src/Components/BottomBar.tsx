import React from "react";

type Props = { leftAction: () => void; rightAction: () => void };

const BottomBar = (props: Props) => {
  const { leftAction, rightAction } = props;
  return (
    <div className="flexCenter absolute inset-x-0 bottom-0 h-[100px] w-screen overflow-hidden bg-blackish p-5">
      <div className="grid grid-flow-col grid-cols-3 gap-5">
        <button
          onClick={leftAction}
          className="border-2 border-offWhite bg-supple p-3 font-heading uppercase text-blackish"
        >
          Left
        </button>
        <p> </p>
        <button
          onClick={rightAction}
          className="border-2 border-offWhite bg-supple p-3 font-heading uppercase text-blackish"
        >
          Right
        </button>
      </div>
    </div>
  );
};

export default BottomBar;
