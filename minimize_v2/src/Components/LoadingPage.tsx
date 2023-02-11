import logo from "/public/square-svgrepo-com.svg";
import Image from "next/image";
import { gsap, Power0 } from "gsap";
import { useEffect } from "react";

export default function LoadingPage() {
  useEffect(() => {
    gsap.to(".logo", {
      rotation: -360,
      ease: Power0.easeNone,
      repeat: -1,
      duration: 3,
    });
  }, []);

  return (
    <>
      <main className="flexCenter h-screen w-screen bg-fadedPink">
        <div className="grid-flow-cols mb-5 grid grid-cols-4 gap-7">
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
        <div className="grid-flow-cols mb-5 grid grid-cols-4 gap-5">
          <p className="font-title text-9xl">M</p>
          <p className="font-title text-9xl">N</p>
          <p className="font-title text-9xl">M</p>
          <p className="font-title text-9xl">Z</p>
        </div>
      </main>
    </>
  );
}
