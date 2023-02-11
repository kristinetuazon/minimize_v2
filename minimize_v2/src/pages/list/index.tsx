import React, { useContext, useState } from "react";
import Container from "../../Components/Container";
import GlobalContext from "../../Components/GlobalContext";
import ListComponent from "../../Components/List";
import Button from "../../Components/Button";
import { type Item, type List } from "../../types/global";
import { v4 as uuidv4 } from "uuid";
import Arrow from "../../Components/Arrow";

type Props = {};

export default function List({}: Props) {
  const [listItem, setListItem] = useState<string>("");
  const value = useContext(GlobalContext);
  const {
    list,
    setList,
    listName,
    setListName,
    listDescription,
    setListDescription,
    LISTOBJECT,
    localStorage,
    setLocalStorage,
  } = value;

  function handleAddItem() {
    if (listItem === "") return;
    setList([...list, { id: uuidv4(), name: listItem }]);
    setListItem("");
  }

  function deleteFrom(id: string) {
    setList(list.filter((item: Item) => item.id !== id));
  }

  function handleSubmit() {
    setLocalStorage(LISTOBJECT);
  }

  return (
    <>
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
            </p>
          </Container>
          <Arrow />
        </div>
        <div className="flexCenter h-screen w-screen">
          <Container title="new list">
            <div className="flexCenter">
              <p className="flexCenter pb-3 font-heading">Name of List</p>
              <input
                placeholder="General category of the items to sort through"
                className="w-full rounded-md border-2 bg-blackish p-2 font-bodyRegular text-powder shadow-md"
                type="text"
                name="list-name"
                value={listName}
                required
                onChange={(e) => {
                  e.preventDefault;
                  setListName(e.target.value);
                }}
                id=""
              />
              <p className="flexCenter pt-5 pb-3 font-heading">Description</p>
              <textarea
                placeholder="Description about items that are most helpful to you"
                value={listDescription}
                rows={3}
                required
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
                  placeholder="Item name"
                  value={listItem}
                  onChange={(e) => {
                    e.preventDefault;
                    setListItem(e.target.value);
                  }}
                  className="col-span-3 h-[50px] w-[220px] rounded-md border-2  bg-blackish p-2 font-bodyRegular text-powder shadow-md"
                  type="text"
                  name="list-description"
                />
                <button
                  onClick={handleAddItem}
                  className="rounded-full border-2 border-blackish bg-fadedPink p-2 hover:bg-powder"
                >
                  <p className="font-body text-2xl"> + </p>
                </button>
              </div>
              {list.length > 0 ? (
                <ListComponent deleteFrom={deleteFrom} list={list} />
              ) : (
                ""
              )}
            </div>
          </Container>
          <Button action={handleSubmit} page="/sort">
            next
          </Button>
        </div>
      </main>
    </>
  );
}
