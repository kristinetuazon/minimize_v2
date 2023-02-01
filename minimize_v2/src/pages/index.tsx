import { useEffect } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import { api } from "../utils/api";
import logo from "/public/square-svgrepo-com.svg";
import Image from "next/image";
import { gsap, Power0 } from "gsap";
import Button from "../Components/Button";
import Container from "../Components/Container";

const Home: NextPage = () => {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });

  useEffect(() => {
    gsap.to(".logo", {
      rotation: -360,
      ease: Power0.easeNone,
      repeat: -1,
      duration: 3,
    });

    // gsap.to(".flexCenter", {
    //   duration: 3,
    // });
  }, []);




  return (
    <>
      <Head>
        <title>minimize v2</title>
        <meta
          name="description"
          content="A decluttering list-sorting application."
        />
        <link rel="icon" href="/square-svgrepo-com.svg" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-fadedPink">
        <div className="grid-flow-cols mb-5 grid grid-cols-4 gap-10">
          <Image
            id="logo"
            alt="logo"
            src={logo}
            height="50"
            className="logo pb-2"
          />
          <Image
            id="logo"
            alt="logo"
            src={logo}
            height="50"
            className="logo pb-2"
          />
          <Image
            id="logo"
            alt="logo"
            src={logo}
            height="50"
            className="logo pb-2"
          />
           <Image
            id="logo"
            alt="logo"
            src={logo}
            height="50"
            className="logo pb-2"
          />
        </div>
        <h1 id="title" className="font-title text-9xl">
          MINIMIZE
        </h1>
        <span className="mb-10 font-heading text-2xl">
          curate, sort, free your life
        </span>
      </main>
      <div className="flexCenter w-screen h-screen bg-fadedPink">
      <Container title="too much stuff?">
        Have you ever wondered why you had so much stuff? Marie Kondo put it so simply as: does these things give you joy? Minimize is a web application that will help you declutter your life tinder-style. It means you could take an inventory of items you wish to sort, swipe or drag left or right to figure out which items you want or don't want to keep and act on the results.</Container>
  

  <Button page="/list"> click here to start </Button>
      </div>
    </>
  );
};

export default Home;
