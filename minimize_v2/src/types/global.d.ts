export type Item = {
    id: string;
    name: string;
}

export type List = {
    id: string;
    listName: string;
    description: string;
    listOfItems: Item[];
}

