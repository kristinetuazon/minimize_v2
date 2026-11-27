# Minimize - Version 2

## Introduction
A decluttering list-sorting application. Version 2. Initially simplified and optimized. 

Are you looking to declutter your closet or the unmentionable drawer you have in your kitchen? Are you backpacking and you&apos;re not sure what to bring? Are you moving homes and you want to take a general inventory of what you are bringing?

Inspired by Marie Kondo&apos;s "what sparks joy" and the Minimalist lifestyle--Minimize aspires to help you sort through your things (clothes, books---anything) in two categories: yes and no.

## Features
- **List** – name your list, add items one by one, paste a whole list at once, or start from a template
- **Sort** – swipe cards right to keep, left to let go, up for maybe (or use the buttons / ← ↑ → keys), with undo and a second round for maybes
- **Act** – pick a plan for each let-go item (donate, sell, give, recycle, throw away), tick it off, and track progress
- Everything is saved in your browser, so a refresh doesn't lose your progress
- Light and dark mode; respects reduced-motion settings

## Future Features
- Multiple saved lists
- Photos for items
- Export and share results
- Installable web app (PWA)
- Accounts and sync

## Tech Stack

- [Next.js](https://nextjs.org) (App Router) + React
- [Tailwind CSS](https://tailwindcss.com) v4
- [Motion](https://motion.dev) for the swipe cards
- [Playwright](https://playwright.dev) for end-to-end tests

## Fonts
Petrona is licensed under the SIL Open Font License. **Holipop and Bargemo are free for personal use only** – buy commercial licenses (links in `Assets/*/Read Me !!!.txt`) or swap them in `src/app/fonts.ts` before any commercial launch.

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
