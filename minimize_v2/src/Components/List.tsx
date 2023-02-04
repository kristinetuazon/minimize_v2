import React from 'react'
import ListItem from "../Components/ListItem"

type Props = {}

const ListComponent = (props: Props) => {
  return (
    <ul className="bg-fadedPink rounded-md flexCenter border-2 p-3 mt-5 w-full overflow-scroll max-h-[300]">
        <ListItem/>
    </ul>
  )
}

export default ListComponent;