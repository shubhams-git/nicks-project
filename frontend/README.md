# Frontend

React client for drafting, generating, reviewing, and copying structured responses.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Headless UI
- Axios
- driver.js

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

## Environment Variables

Create `.env` from `.env.example`.

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

## Run Locally

```bash
npm install
npm run dev
```

## Features

- Focus area selection
- Optional custom focus area input
- Draft editor
- Structured response rendering
- Copy-to-clipboard action
- First-use onboarding tour

## API Integration

The frontend sends requests to:

- `POST /rewrite`

through the configured API base URL in `src/lib/api.ts`.

Example production value:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

## Structure

```text
src/
├── App.tsx
├── index.css
├── main.tsx
├── lib/
│   └── api.ts
└── services/
    └── rewriteApi.ts
```

## Notes

- The onboarding tour is shown once per browser using `localStorage`
- The UI is optimized for both mobile and desktop use
