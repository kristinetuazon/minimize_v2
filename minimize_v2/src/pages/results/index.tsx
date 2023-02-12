import React, { useContext } from "react";
import Container from "../../Components/Container";
import GlobalContext from "../../Components/GlobalContext";
import Arrow from "../../Components/Arrow";
import FinalList from "../../Components/FinalList";
import { type GlobalContextType } from "../../types/global";


const Results = () => {
  const value = useContext<GlobalContextType>(GlobalContext);
  const { yesList, noList, LISTOBJECT } = value;

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
          <Container title={LISTOBJECT!.listName}>
            {LISTOBJECT!.description}
            {/* <Button action={() => {}}> Screenshot</Button>  */}
          </Container>
          <div className="flex xxsm:flex-col xsm:flex-col sm:flex-col md:flex-row lg:flex-row ">
            <div className="sm:h-max-[300px] xsm:h-max-[200px] xxsm:h-max-[200px] xxsm:overflow-scroll xsm:overflow-scroll sm:overflow-scroll md:mr-10 lg:mr-10">
              <FinalList listName={"Yes List"} list={yesList!} />
            </div>

            <div className="sm:h-max-[300px] xsm:h-max-[200px] xxsm:h-max-[200px] xxsm:overflow-scroll xsm:overflow-scroll sm:overflow-scroll">
              <FinalList listName={"No List"} list={noList!} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Results;
