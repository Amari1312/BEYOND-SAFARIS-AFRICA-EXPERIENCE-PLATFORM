# Beyond Safari

Beyond Safari is a travel discovery and booking platform for authentic African experiences. It helps travelers explore wildlife, culture, coastal escapes, and adventure activities in one place while giving local hosts and tourism businesses a clear digital presence.

## Overview

Kenya and East Africa are rich in immersive travel experiences, but discovery is often scattered across social media, individual websites, and informal channels. Beyond Safari brings those experiences together in a single experience-driven platform with clear listings, planning tools, and user accounts.

## What the platform offers

- Discover curated experiences such as safaris, heritage walks, beach escapes, food trails, and community-led adventures.
- Browse experience listings and detailed views with pricing, location, ratings, and host information.
- Support travelers with authentication, profile access, and trip-planning flows.
- Provide business and admin-facing views for experience and booking management.
- Include AI-assisted support and payment-route scaffolding for future booking expansion.

## Core technologies

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- UI libraries: lucide-react, react-icons
- Backend and data: Firebase Authentication, Firestore, Storage
- Seeding: Node.js and Firebase Admin SDK
- Tooling: ESLint and Next.js build pipeline

## Repository structure

```text
backend/                    # Firebase Admin seeding scripts and Firestore setup
frontend/beyond-safari/    # Main Next.js application
```

The main application lives under the frontend directory and includes:

- app routes for home, experiences, login, signup, profile, and dashboard views
- reusable UI components and experience cards
- Firebase integration for authentication and persistence
- mock and seeded data for experience discovery and demo flows

## Prerequisites

Before you begin, make sure you have:

- Node.js 20 or newer
- npm 10 or newer
- A Firebase project with Authentication, Firestore, and Storage enabled
- Optional: a service account JSON file for Firebase Admin seeding

## Environment variables

Create a .env.local file inside the frontend application directory and add the Firebase values for your project:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## Local development

1. Install frontend dependencies:

```bash
cd frontend/beyond-safari
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open http://localhost:3000 in your browser.

## Backend seeding

The backend folder includes a Firestore seeding script for sample users, experiences, bookings, and related collections.

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Run the seed script:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json npm run seed
```

If you are using Application Default Credentials instead of a service account file, you can run the script without the environment variable and rely on your local Firebase authentication setup.

## Available scripts

From the frontend application directory:

- npm run dev — start the local development server
- npm run build — create a production build
- npm run start — run the production build locally
- npm run lint — run the linter

## Current project status

This repository is currently an MVP-style implementation. The experience discovery experience is already well represented in the UI, while authentication and data persistence are connected to Firebase. Some booking and payment flows are scaffolded and may require additional backend work before full production use.

## Contributing

Contributions are welcome. If you plan to make changes, please create a focused branch, keep your work scoped, and document any new environment requirements.

## License

A project license has not been defined yet. If you intend to publish or distribute this application, add an appropriate license file before release.

