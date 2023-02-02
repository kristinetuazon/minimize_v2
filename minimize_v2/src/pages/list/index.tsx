import React, { useContext } from "react";
import Container from "../../Components/Container";
import NavBar from "../../Components/NavBar";
import GlobalContext from "../../Components/GlobalContext";

type Props = {};

export default function List({}: Props) {
  const value = useContext(GlobalContext);
  const {
    listItem,
    selectedItem,
    setSelectedItem,
    setListItem,
    addOn,
    deleteFrom,
    listItemHandler,
    resetInput,
    listName,
    setListName,
    listDescription,
    setListDescription,
  } = value;


  return (
    <>
      <NavBar />
      <main className=" bg-fadedPink">
        <div className="flexCenter h-screen w-screen">
          <Container title="Step One">
            <p className="font-bodyRegular text-center">Let's list the things you want to declutter. 
            <br/><br/> It could be clothes in
            the same drawer, a pile of books or maybe overweight luggage that you
            need help in sorting which is essential or not. It could also be just
            bunch of things with no particular relation that you want to
            scrutinize. Whatever it may be, we will be taking a list of these
            things. <br/><br/> Scroll ⬇️ to start!</p>
          </Container>
        </div>
        <div className="flexCenter h-screen w-screen">
          <Container title="new list">
          <div className="flexCenter">
            <p className="flexCenter pb-3 font-heading">Name of List</p>
            <input className="w-full p-2 shadow-md rounded-md border-2" type="text" name="list-name" value={listName} onChange={(e)=>{setListName(e.target.value)}} id="" />
            <p className="flexCenter pt-5 pb-3 font-heading">Description</p>
            <input className="w-[100%] p-2 shadow-md rounded-md border-2" type="text" name="list-description" value={listDescription} onChange={(e)=>{setListDescription(e.target.value)}}id="" />
            <p></p>

            <p className="pt-7"> </p>
            <input className="justify-self-center col-span-2 w-[100%] h-[50%] p-2 shadow-md rounded-md border-2"></input>
            <div className = "mt-5 grid grid-cols-2 gap-2">
            <button className="border-2 p-3 rounded-full mt-5 border-blackish bg-offWhite hover:bg-powder"> <p className="font-body text-3xl">+</p></button>
            <button className="border-2 p-3 rounded-full mt-5 border-blackish bg-offWhite hover:bg-powder"> <p className="font-body text-3xl">-</p></button>
             </div>
            </div>
          </Container>
        </div>
      </main>
    </>
  );
}
