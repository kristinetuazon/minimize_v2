import React from 'react'
import dynamic from "next/dynamic";

const TinderCard = dynamic(
    () => {
      return import("react-tinder-card");
    },
    { ssr: false }
  );

type Props = {}

const TinderCards = (props: Props) => {
  return (
    <div>TinderCards</div>
  )
}