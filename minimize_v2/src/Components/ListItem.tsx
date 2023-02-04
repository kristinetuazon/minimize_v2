import React from "react";

type Props = {};

const ListItem = (props: Props) => {
  return (
    <li className="font-bodyRegular">
      <div className="mt-1 grid grid-cols-2 place-items-center">
        <p className="">hellofdsfdsf</p>
        <button className="ml-5 rounded-full border-2 border-blackish bg-fadedPink p-2 hover:bg-powder">
          <p className="font-body text-2xl"> - </p>
        </button>
      </div>
    </li>
  );
};

export default ListItem;
