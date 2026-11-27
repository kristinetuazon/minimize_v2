import React from "react";
import { useRouter } from "next/router";
import Container from "../../Components/Container";
import Button from "../../Components/Button";
import { useList } from "../../Components/GlobalContext";
import Arrow from "../../Components/Arrow";
import FinalList from "../../Components/FinalList";

const Results = () => {
  const router = useRouter();
  const { state, yesList, noList, remaining, startOver } = useList();
  const hasHeader = state.listName !== "" || state.description !== "";

  function handleStartOver() {
    if (!window.confirm("Clear this list and start a new one?")) return;
    startOver();
    void router.push("/list");
  }

  return (
    <main>
      <section className="flexCenter relative min-h-screen w-full py-24">
        <Container title="Step Three">
          <p className="text-center font-bodyRegular">
            This is the final step of the process: this is the result of the
            decision you made. Of course, for change to happen it will require
            you to take action on the results you see.
            <br />
            <br />
            For the things you decide to keep: cherish them and make them last
            as long as you can.
            <br />
            <br /> For the things you decide to let go: instead of throwing
            them away, try donating them to charity, selling them online (if
            they are still in good condition), or repurposing them.
          </p>
        </Container>
        <Arrow />
      </section>
      <section className="flexCenter min-h-screen w-full py-24">
        {hasHeader ? (
          <Container title={state.listName || "Your list"}>
            {state.description ? (
              <p className="text-center font-bodyRegular">{state.description}</p>
            ) : null}
          </Container>
        ) : null}
        <div className="flex flex-col md:flex-row md:gap-10">
          <FinalList listName="Yes List" list={yesList} />
          <FinalList listName="No List" list={noList} />
        </div>
        {remaining.length > 0 ? (
          <p className="mt-6 font-bodyRegular">
            {remaining.length} item{remaining.length === 1 ? "" : "s"} still to
            sort.
          </p>
        ) : null}
        <div className="flex flex-wrap justify-center gap-4">
          {remaining.length > 0 ? (
            <Button page="/sort">keep sorting</Button>
          ) : null}
          <Button onClick={handleStartOver}>start a new list</Button>
        </div>
      </section>
    </main>
  );
};

export default Results;
