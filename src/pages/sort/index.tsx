import React from "react";
import dynamic from "next/dynamic";
import Container from "../../Components/Container";
import Button from "../../Components/Button";
import Arrow from "../../Components/Arrow";
import { useList } from "../../Components/GlobalContext";

const TinderCards = dynamic(() => import("../../Components/TinderCards"), {
  ssr: false,
});

const Sort = () => {
  const { state, remaining } = useList();
  // The deck shows its own results button once everything is sorted.
  const showResultsLink = state.decisions.length > 0 && remaining.length > 0;

  return (
    <main className="w-full">
      <section className="flexCenter relative min-h-screen w-full py-24">
        <Container title="Step Two">
          <p className="text-center font-bodyRegular">
            This is the step when you&apos;ll have to make a decision: whether
            this object is something that you still use, or is it something
            that you need to let go of? In this step you are given two choices:
            swipe ⬅️ to let go, or ➡️ to keep.
          </p>
        </Container>
        <Arrow />
      </section>
      <section className="flexCenter relative min-h-screen w-full py-24">
        <Container title="Questions for Thought">
          <p className="mb-4 text-center font-bodyRegular">
            Let your decision be guided by these following questions:
          </p>
          <ul className="text-left font-bodyRegular">
            <li>✨ Have I used this item in the last year?</li>
            <li>✨ Is this item in good condition/working properly?</li>
            <li>✨ Do I have space to store this item?</li>
            <li>✨ Does this item serve a purpose in my life?</li>
            <li>✨ Do I have something that is similar?</li>
          </ul>
        </Container>
        <Arrow />
      </section>
      <section className="flexCenter min-h-screen w-full overflow-hidden py-24">
        <TinderCards />
        {showResultsLink ? (
          <Button page="/results" className="mt-6">
            see your results
          </Button>
        ) : null}
      </section>
    </main>
  );
};

export default Sort;
