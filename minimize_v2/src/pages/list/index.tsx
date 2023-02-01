import React from 'react';
import Container from '../../Components/Container';
import NavBar from '../../Components/NavBar';

type Props = {}

export default function List({}: Props) {
  return (
    <>
    <NavBar/>
    <main className=" bg-fadedPink">
      <div className = "w-screen h-screen flexCenter">
      <Container title="Step One">Let's list the things you want to declutter. It could be clothes in the same drawer, pile of books or maybe overweight luggage that you need help in sorting which is essential or not. It could just be a random list of things that you want to scrutinize. Whatever it may be, we will be taking a list of these things. Scroll ⬇️ to start! </Container>
      </div>
      <div className = "w-screen h-screen flexCenter">
        <Container title="Sorting box"></Container>
      </div>
    </main>
    </>
  )
}