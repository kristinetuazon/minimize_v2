import { useEffect } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import { api } from "../utils/api";
import logo from "/public/square-svgrepo-com.svg";
import Image from "next/image";
import { gsap, Power0 } from "gsap";
import Button from "../Components/Button";

const Home: NextPage = () => {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });

  useEffect(() => {
    const timeline = gsap.timeline({ defaults: { duration: 2, ease: "none" } });
    // timeline.to("#title", {duration: 1, x: 50, y: 0});

    let dur = 5;
    gsap.to(".logo", {
      rotation: -360,
      ease: Power0.easeNone,
      repeat: -1,
      duration: 10,
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
        <div className="grid-flow-cols mb-5 grid grid-cols-3 gap-10">
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

        <Button page="/sort"> click here to start </Button>
      </main>
    </>
  );
};

export default Home;
