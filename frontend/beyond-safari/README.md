# Beyond Safari Frontend

This directory contains the main Next.js frontend for Beyond Safari, a travel discovery platform focused on authentic experiences across East Africa.

## What the app includes

- A responsive home experience with hero content and discovery tools
- Experience listings, detail pages, and itinerary planning views
- Authentication flows for login and signup using Firebase
- Traveler, business, and admin dashboard layouts
- Search and AI-assisted support components

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Firebase client SDK
- lucide-react and react-icons

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Create a .env.local file with your Firebase configuration values.

3. Run the development server:

```bash
npm run dev
```

4. Open http://localhost:3000.

## Available scripts

- npm run dev
- npm run build
- npm run start
- npm run lint

## Notes

The current frontend uses mock experience data for much of the UI, while authentication and user-specific interactions are wired through Firebase. Some booking and payment routes are present as scaffolding and may evolve as the product matures.

