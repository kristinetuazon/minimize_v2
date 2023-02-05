import React, {useState, useContext} from 'react'
import ListItem from "../Components/ListItem"
import { type Item } from '../types/global'
// import GlobalContext from './GlobalContext'

type Props = {}

const ListComponent = (props: Props) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);





  return (
    <ul className="bg-fadedPink rounded-md flexCenter border-2 p-3 mt-5 w-full overflow-scroll max-h-[300]">
        <ListItem/>
    </ul>
  )
}

export default ListComponent;