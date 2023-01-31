import React from 'react';
import Container from '../../Components/Container';
import NavBar from '../../Components/NavBar';

type Props = {}

export default function Sort({}: Props) {
  return (
    <>
    <NavBar/>
    <main className=" bg-fadedPink">
      <div className = "w-screen h-screen flexCenter">
      <Container title="Hello">Minimize is a application that will help you declutter your life tinder-style. </Container>
      </div>
    </main>
    </>
  )
}