import React, { useContext, useState } from "react";
import Container from "../../Components/Container";
import NavBar from "../../Components/NavBar";
import GlobalContext from "../../Components/GlobalContext";

type Props = {};

export default function List({}: Props) {
  const [listItem, setListItem] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const value = useContext(GlobalContext);
  const {
    list,
    addOn,
    deleteFrom,
    listName,
    setListName,
    listDescription,
    setListDescription,
  } = value;

  console.log(listItem, "✨");
  console.log(list);

  return (
    <>
      <NavBar />
      <main className=" bg-fadedPink">
        <div className="flexCenter h-screen w-screen">
          <Container title="Step One">
            <p className="text-center font-bodyRegular">
              Let's list the things you want to declutter.
              <br />
              <br /> It could be clothes in the same drawer, a pile of books or
              maybe overweight luggage that you need help in sorting which is
              essential or not. It could also be just bunch of things with no
              particular relation that you want to scrutinize. Whatever it may
              be, we will be taking a list of these things. <br />
              <br /> Scroll ⬇️ to start!
            </p>
          </Container>
        </div>
        <div className="flexCenter h-screen w-screen">
          <Container title="new list">
            <div className="flexCenter">
              <p className="flexCenter pb-3 font-heading">Name of List</p>
              <input
                className="w-full rounded-md border-2 bg-blackish p-2 font-bodyRegular text-powder shadow-md"
                type="text"
                name="list-name"
                value={listName}
                onChange={(e) => {
                  e.preventDefault;
                  setListName(e.target.value);
                }}
                id=""
              />
              <p className="flexCenter pt-5 pb-3 font-heading">Description</p>
              <textarea
                value={listDescription}
                rows={3}
                className="col-span-2 h-[50%] w-[100%] justify-self-center  rounded-md border-2 bg-blackish p-2 font-bodyRegular text-powder shadow-md"
                onChange={(e) => {
                  e.preventDefault;
                  setListDescription(e.target.value);
                }}
              ></textarea>
              <p></p>

              <p className="pt-7 pb-3 font-heading"> List of Items</p>
              <div className="mt-1 grid grid-cols-4 place-items-center gap-2">
                <input
                  value={listItem}
                  onChange={(e) => {
                    e.preventDefault;
                    setListItem(e.target.value);
                  }}
                  className="col-span-3 h-[50px] w-[100%] rounded-md border-2  bg-blackish p-2 font-bodyRegular text-powder shadow-md"
                  type="text"
                  name="list-description"
                />
                <button
                  onClick={() => {
                    addOn(listItem);
                  }}
                  className="rounded-full border-2 border-blackish bg-fadedPink p-2 hover:bg-powder"
                >
                  <p className="font-body text-2xl"> + </p>
                </button>
                {/* <button className="border-2 p-3 rounded-full mt-5 border-blackish bg-offWhite hover:bg-powder"> <p className="font-body text-3xl">-</p></button> */}
              </div>
            </div>
          </Container>
        </div>
      </main>
    </>
  );
}
