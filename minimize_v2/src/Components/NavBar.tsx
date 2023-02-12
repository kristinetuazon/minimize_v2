import React from "react";
import logo from "./../Assets/square-svgrepo-com.svg";
import Image from "next/image";
import Link from "next/link";
// import { gsap, Power0 } from "gsap";

export default function NavBar() {
  // const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="bg-transparent absolute">
        <Link href={"/"}>
          <Image id="logo" alt="logo" src={logo} className="m-7" height={50} />
        </Link>
      </div>
    </>
  );
}
