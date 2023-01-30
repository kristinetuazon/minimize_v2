import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "../utils/api";
import logo from "/public/square-svgrepo-com.svg"
import Image from "next/image";

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>minimize v2</title>
        <meta name="description" content="A decluttering list-sorting application." />
        <link rel="icon" href="/square-svgrepo-com.svg" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-fadedPink">
      <Image alt="logo" src={logo} height="50" className="pb-2"/>
       <h1 className="font-title text-9xl">MINIMIZE</h1>
       <span className="font-heading text-2xl">
        curate, sort, free your life
       </span>

       <button></button>
      </main>
    </>
  );
};

export default Home;
