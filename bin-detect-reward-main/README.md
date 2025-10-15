# EcoDetect - Trash Detection & Rewards

## Overview

EcoDetect is a React + Vite + TypeScript application that lets users upload images to detect trash/bins and earn points, backed by Supabase (Auth, DB, Edge Functions).

## Tech Stack

- Vite
- React 18
- TypeScript
- shadcn/ui + Radix UI
- Tailwind CSS
- Supabase (Auth, Postgres, Edge Functions)

## Local Development

Prerequisites: Node.js, npm, a Supabase project.

1. Install dependencies
```sh
npm install
```

2. Set environment variables in `.env.local`
```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-public-key>
```

3. Start the dev server
```sh
npm run dev
```

## Backend Setup (Supabase)

1. Link the project and apply migrations
```sh
npx supabase@latest link --project-ref <your-project-ref>
npx supabase@latest db push --yes
```

2. Deploy Edge Function and set AI secret
```sh
npx supabase@latest functions deploy detect-trash --yes
npx supabase@latest functions secrets set LOVABLE_API_KEY=YOUR_LOVABLE_API_KEY --yes
npx supabase@latest functions deploy detect-trash --yes
```

## Notes

- Replace the favicon in `public/favicon.ico` and social preview images in `index.html` as needed.
- Do not expose service role keys in the frontend.
