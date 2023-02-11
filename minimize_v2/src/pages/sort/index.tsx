import React, { useContext } from "react";
import GlobalContext from "../../Components/GlobalContext";
import TinderCard from "../../Components/TinderCard";
import Container from "../../Components/Container";
import Button from "../../Components/Button";

type Props = {};

const Sort = (props: Props) => {
  const contextValue = useContext(GlobalContext);
  const {} = contextValue;
  return (
    <>
      <main className="w-screen bg-fadedPink">
        <div className="flexCenter h-screen w-screen">
          <Container title={"Step Two"}>
            <p className="text-center font-bodyRegular">
              This is the step when you'll have to make a decision: whether this
              object is something that you still use, or is it something that
              you need to let go of? In this step you are given two
              choices, ⬅️ for no and ➡️ for yes.
            </p>
          </Container>
        </div>
        <div className="flexCenter h-screen w-screen">
          <Container title={"Questions"}>
            <p className="text-center font-bodyRegular">
             Let your decision be fueled by
              these following questions:
            </p>
            <br></br>
            <ul className="text-left font-bodyRegular">
              <li>✨ Have I used this item in the last year?</li>
              <li>✨ Is this item in good condition/working properly?</li>
              <li>✨ Do I have space to store this item?</li>
              <li>✨ Does this item serve a purpose in my life?</li>
              <li>✨ Do I have something that is similar?</li>
              <li>
                ✨ Is this item necessary for my day-to-day life or personal
                goals?
              </li>
            </ul>
<br />
            <p className="text-center font-bodyRegular" >Scroll ⬇️ to begin the sorting!</p>
          </Container>
        </div>
        <div className="relative flexCenter h-screen w-screen overflow-hidden">
          <TinderCard />
          <Button page="/results">See your Results</Button>
        </div>
      </main>
    </>
  );
};

export default Sort;
