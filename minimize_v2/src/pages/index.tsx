import { useEffect, useLayoutEffect } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "../utils/api";
import logo from "/public/square-svgrepo-com.svg";
import Image from "next/image";
import gsap from "gsap";
import Button from "../Components/Button";

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  useLayoutEffect(() => {
    const timeline = gsap.timeline({ defaults: { duration: 2, ease: "none" } });
    timeline.to("#title", {
      duration: 1,
      scrambleText: {
        text: "THIS IS NEW TEXT",
        chars: "XO",
        revealDelay: 0.5,
        speed: 0.3,
        tweenLength: false,
      },
    });
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
        <Image alt="logo" src={logo} height="50" className="pb-2" />
        <h1 id="title" className="font-title text-9xl">
          MINIMIZE
        </h1>
        <span className="font-heading text-2xl mb-10">
          curate, sort, free your life
        </span>

        <Button page="/sort"> click here to start </Button>

      </main>
    </>
  );
};

export default Home;
