# Minimize - Version 2

## Introduction
A decluttering list-sorting application. Version 2. Initially simplified and optimized. 

Are you looking to declutter your closet or the unmentionable drawer you have in your kitchen? Are you backpacking and you&apos;re not sure what to bring? Are you moving homes and you want to take a general inventory of what you are bringing?

Inspired by Marie Kondo&apos;s "what sparks joy" and the Minimalist lifestyle--Minimize aspires to help you sort through your things (clothes, books---anything) in two categories: yes and no.

## Features
- **List** – name your list, add items one by one, paste a whole list at once, or start from a template
- **Sort** – swipe cards right to keep, left to let go, up for maybe (or use the buttons / ← ↑ → keys), with undo, a second round for maybes, and a guide with tips matched to what you're sorting
- **Act** – pick a plan for each let-go item (donate, sell, give, recycle, throw away), tick it off, and track progress
- **Multiple lists** – keep as many lists as you like and pick any back up where you left off
- **Camera** – snap items one after another with the in-app camera; name them now or later
- **Photos** – add a photo to any item; it shows on the swipe card and in your results
- **Rename anything** – tap an item's name to fix it; deletes can be undone from the toast
- **Keep-only-N** – set a limit ("only 10 fit in the suitcase") and narrow down until you're under it
- **Packing checklist** – tick off kept items as they go in the bag or back on the shelf
- **Let go to rise** – a hot-air balloon climbs from the rooftops to the galaxy as you let things go; every finished list becomes a travel-poster postcard on your Journey page
- **Reminders & progress** – see what's still waiting to go, and lifetime totals of what you've let go
- **Share & export** – share or copy your results, download a CSV, print, or send an invite link so someone else can sort the same list
- **Installable** – add it to your home screen; it works offline
- Everything is saved on your device (lists in localStorage, photos in IndexedDB) – nothing is uploaded. Minimize asks the browser to protect that storage, and **Journey → Your data** lets you download a backup file (lists, settings and photos) and restore it on another device
- Playful GSAP animations (a cluttered title that tidies itself, cards dealt onto the table, confetti when you finish) – all switched off when your device asks for reduced motion
- Night mode: follows your device, or flip it with the moon / sun button (remembered per device)

- **About** – why Minimize exists, how your data is kept, and a link to the maker's portfolio

## Future Features
- Accounts and sync across devices
- AI help: turn one photo of a shelf into a list

## Tech Stack

- [Next.js](https://nextjs.org) (App Router) + React
- [Tailwind CSS](https://tailwindcss.com) v4
- [GSAP](https://gsap.com) for page and celebration animations
- [Motion](https://motion.dev) for the draggable swipe cards
- [Playwright](https://playwright.dev) for end-to-end tests

## Fonts
All fonts are free for commercial use under the SIL Open Font License: [Poiret One](https://fonts.google.com/specimen/Poiret+One) (titles), [Josefin Sans](https://fonts.google.com/specimen/Josefin+Sans) Light (headings) and Petrona (body). They're set up in `src/app/fonts.ts`.

# Getting Started
## Prerequisites
- Node.js 20.9+
- npm


## Installing
- Clone the repository to your local machine:

```git clone https://github.com/kristinetuazon/minimize_v2```

- Navigate to the project directory:

```cd minimize_v2```

- Install the dependencies:

```npm install```

- Start the development server:

```npm run dev```

## Deployment
This application is ready for deployment to any web server. Simply build the application using the following command:

```npm run build```
And then serve the `build` folder to your desired web server.


## Contributing
If you would like to contribute to this project, please submit a pull request for review.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

- Run the end-to-end tests (uses your installed Google Chrome):

```npm test```
