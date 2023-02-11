import React, { useContext, useRef } from "react";
import Container from "../../Components/Container";
import GlobalContext from "../../Components/GlobalContext";
import Arrow from "../../Components/Arrow";
import FinalList from "../../Components/FinalList";
import Button from "../../Components/Button";

type Props = {};

const Results = (props: Props) => {
  const value = useContext(GlobalContext);
  const { yesList, noList, maybeList, LISTOBJECT } = value;

  const screenshotRef = useRef(null);

  // console.log(isLoading,"✨")
  // console.log(image, "🧩")

  console.log(LISTOBJECT);
  console.log(yesList);
  console.log(noList);
  console.log(maybeList);
  return (
    <>
      <main>
        <div className="flexCenter h-screen w-screen  bg-fadedPink">
          <Container title={"Step Three"}>
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
              them. try donating them to charity, sell them online (if they are
              still of good condition), or repurpose them.
            </p>
          </Container>
          <Arrow />
        </div>
        <div className="flexCenter h-screen w-screen justify-center bg-fadedPink">
          <Container title={LISTOBJECT.listName}>
          {LISTOBJECT.description}
          {/* <Button action={() => {}}> Screenshot</Button>  */}
          </Container>
          <div className="flex xxsm:flex-col xsm:flex-col sm:flex-col md:flex-row lg:flex-row ">
            <div className="lg:mr-10 md:mr-10 sm:h-max-[300px] sm:overflow-scroll xsm:h-max-[200px] xsm:overflow-scroll xxsm:h-max-[200px] xxsm:overflow-scroll">
              <FinalList listName={"Yes List"} list={yesList} />
            </div>

            <div className="sm:h-max-[300px] sm:overflow-scroll xsm:h-max-[200px] xsm:overflow-scroll xxsm:h-max-[200px] xxsm:overflow-scroll">
              <FinalList listName={"No List"} list={noList} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Results;
