import { type NextPage } from "next";
import Head from "next/head";
import Button from "../Components/Button";
import Container from "../Components/Container";
import Arrow from "../Components/Arrow";
import { useList } from "../Components/GlobalContext";

const Home: NextPage = () => {
  const { state, hydrated } = useList();
  const hasSavedList = hydrated && state.items.length > 0;

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
      <main>
        <section className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <h1 id="title" className="font-title text-7xl sm:text-8xl md:text-9xl">
            MINIMIZE
          </h1>
          <p className="mb-10 font-heading text-xl md:text-2xl">
            curate, sort, free your life
          </p>
          <Arrow />
        </section>
        <section className="flexCenter min-h-screen w-full py-24">
          <Container title="Minimize is...">
            <p className="text-center font-bodyRegular">
              Have you ever wondered why you had so much stuff? <br />
              <br /> Minimize is a web application that will help you declutter
              your life tinder-style. It means you could take an inventory of
              items you wish to sort, swipe or drag left or right to figure out
              which items you want or don&apos;t want to keep and act on the
              results.
            </p>
          </Container>

          <Button page="/list">
            {hasSavedList ? "continue your list" : "click here to start"}
          </Button>
        </section>
      </main>
    </>
  );
};

export default Home;
