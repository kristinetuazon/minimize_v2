import React from "react";
import { useEffect, useState } from "react";
import logo from "/public/square-svgrepo-com.svg";
import Image from "next/image";
import Link from "next/link";
// import { gsap, Power0 } from "gsap";

type Props = {};

export default function NavBar({}: Props) {
  const [isHover, setIsHover] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // useEffect(() => {
  //   console.log(isHover);
  // }, [isHover]);

  const handleMouseEnter = () => {
    setIsHover(true);
  };

  const handleMouseLeave = () => {
    setIsHover(false);
  };

  const handleMouseClick = () => {
    setIsOpen(true);
  };

  return (
    <>
      <div className="absolute bg-transparent">
        <Link href={"/"}><Image
          id="logo"
          alt="logo"
          src={logo}
          height="50"
          className="m-7"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
        </Link>
      </div>

      {isOpen ? <div></div> : ""}
    </>
  );
}
