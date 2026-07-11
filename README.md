# Beyond Safari

Beyond Safari is a travel discovery and booking platform for authentic African experiences. It helps travelers explore wildlife, culture, coastal escapes, and adventure activities in one place while giving local hosts and tourism businesses a clear digital presence.

## Overview

Kenya and East Africa are rich in immersive travel experiences, but discovery is often scattered across social media, individual websites, and informal channels. Beyond Safari brings those experiences together in a single experience-driven platform with clear listings, planning tools, and user accounts.

## What the platform offers

- Discover curated experiences such as safaris, heritage walks, beach escapes, food trails, and community-led adventures.
- Browse experience listings and detailed views with pricing, location, ratings, and host information.
- Support travelers with authentication, profile access, and trip-planning flows.
- Provide business and admin-facing views for experience and booking management.
- Included AI-assisted support for travel curation (powered by Gemini API) and scaffolded payment routes (M-Pesa, Visa) for future booking expansion.

## Core technologies

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **UI libraries**: lucide-react, react-icons
- **Backend & Data**: Firebase Authentication, Firestore, Storage
- **AI Agent**: Gemini API integration for a conversational travel assistant
- **Tooling**: ESLint and Next.js build pipeline

## Repository structure

This project uses a unified standard Next.js fullstack layout. All source code, components, and API routes reside within the `src/` directory.

```text
src/
  app/         # Next.js app router (pages, layouts, api routes)
  components/  # Reusable UI components
  data/        # Mock data resources
  types/       # TypeScript type definitions
  utils/       # Helper functions (Firebase initialization, etc.)
public/        # Static assets (images, fonts, icons)
```

## Prerequisites

Before you begin, make sure you have:

- Node.js 20 or newer
- npm 10 or newer
- A Firebase project with Authentication and Firestore enabled
- A Gemini API Key for the AI assistant functionality

## Environment variables

Create a `.env.local` file inside the root directory and add the following keys for your project:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=

# M-Pesa API Keys (Optional for local testing)
MPESA_CONSUMER_KEY_PROD=
MPESA_CONSUMER_SECRET_PROD=
MPESA_PASSKEY_PROD=
MPESA_SHORTCODE_PROD=

MPESA_CONSUMER_KEY_SANDBOX=
MPESA_CONSUMER_SECRET_SANDBOX=
MPESA_PASSKEY_SANDBOX=
MPESA_SHORTCODE_SANDBOX=

# Visa API Keys (Optional for local testing)
VISA_API_KEY_PROD=
VISA_SHARED_SECRET_PROD=

VISA_API_KEY_SANDBOX=
VISA_SHARED_SECRET_SANDBOX=
```

## Local development

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Backend seeding

A mock data seeding script is provided to quickly populate your Firestore database with sample experiences and events.

Run the seed script from the root of the project:

```bash
node seed-mock-data.js
```

## Available scripts

- `npm run dev` — start the local development server
- `npm run build` — create a production build
- `npm run start` — run the production build locally
- `npm run lint` — run the linter

## Current project status

This repository is currently an MVP-style implementation. The experience discovery interface is well-represented in the UI, while authentication and data persistence are fully connected to Firebase. Booking and payment flows are scaffolded via Next.js API routes, supporting production and sandbox fallback logic.

## Contributing

Contributions are welcome. If you plan to make changes, please create a focused branch, keep your work scoped, and document any new environment requirements.

## License

A project license has not been defined yet. If you intend to publish or distribute this application, add an appropriate license file before release.
