import React, { useState } from "react";
import Container from "../../Components/Container";
import { useList } from "../../Components/GlobalContext";
import ListComponent from "../../Components/List";
import Button from "../../Components/Button";
import Arrow from "../../Components/Arrow";

const inputClasses =
  "w-full rounded-md border-2 bg-blackish p-2 font-bodyRegular text-powder shadow-md";

export default function ListPage() {
  const [listItem, setListItem] = useState("");
  const { state, setListName, setDescription, addItem, removeItem } =
    useList();

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    addItem(listItem);
    setListItem("");
  }

  const hasItems = state.items.length > 0;

  return (
    <main>
      <section className="flexCenter relative min-h-screen w-full py-24">
        <Container title="Step One">
          <p className="text-center font-bodyRegular">
            Let&apos;s list the things you want to declutter.
            <br />
            <br /> It could be clothes in the same drawer, a pile of books or
            maybe overweight luggage that you need help in sorting which is
            essential or not. It could also be just bunch of things with no
            particular relation that you want to scrutinize. Whatever it may
            be, we will be taking a list of these things.
          </p>
        </Container>
        <Arrow />
      </section>
      <section className="flexCenter min-h-screen w-full py-24">
        <Container title="new list">
          <label htmlFor="list-name" className="block pb-3 text-center font-heading">
            Name of List
          </label>
          <input
            id="list-name"
            placeholder="General category of the items to sort through"
            className={inputClasses}
            type="text"
            value={state.listName}
            onChange={(e) => setListName(e.target.value)}
          />
          <label
            htmlFor="list-description"
            className="block pt-5 pb-3 text-center font-heading"
          >
            Description
          </label>
          <textarea
            id="list-description"
            placeholder="Description about the items that are most helpful to you"
            value={state.description}
            rows={3}
            className={inputClasses}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label
            htmlFor="list-item"
            className="block pt-7 pb-3 text-center font-heading"
          >
            List of Items
          </label>
          <form onSubmit={handleAddItem} className="flex items-center gap-2">
            <input
              id="list-item"
              placeholder="Item name, then press Enter"
              value={listItem}
              onChange={(e) => setListItem(e.target.value)}
              className={`${inputClasses} h-[50px] flex-1`}
              type="text"
              autoComplete="off"
            />
            <button
              type="submit"
              aria-label="Add item"
              disabled={listItem.trim() === ""}
              className="h-12 w-12 shrink-0 rounded-full border-2 border-blackish bg-fadedPink text-2xl hover:bg-powder disabled:opacity-50"
            >
              +
            </button>
          </form>
          {hasItems ? (
            <ListComponent deleteFrom={removeItem} list={state.items} />
          ) : (
            <p className="mt-4 text-center font-bodyRegular text-sm opacity-70">
              Add at least one item to start sorting.
            </p>
          )}
        </Container>
        <Button page="/sort" disabled={!hasItems}>
          next
        </Button>
      </section>
    </main>
  );
}
