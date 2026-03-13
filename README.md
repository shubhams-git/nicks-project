# Nicks Project

Web application for turning rough safety reflection notes into structured, copy-ready responses.

## Overview

- `frontend/`: React + Vite client
- `backend/`: Express API with Gemini structured output

The app flow is:

1. Select a focus area
2. Write a draft
3. Generate a structured response
4. Copy the result

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Headless UI, driver.js
- Backend: Express, Zod, Google Gemini via `@google/genai`

## Repository Layout

```text
.
├── backend
│   ├── src
│   ├── .env.example
│   └── package.json
├── frontend
│   ├── src
│   ├── .env.example
│   └── package.json
└── README.md
```

## Local Development

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Required backend environment variables:

```env
PORT=4000
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-2.5-flash
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Required frontend environment variables:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

## Production

- Frontend is deployed on Vercel
- Backend is deployed on Render

Set `VITE_API_BASE_URL` to the deployed backend `/api` URL.
Set `FRONTEND_URL` to the deployed frontend origin without a trailing path.

## API

- `GET /api/health`
- `POST /api/rewrite`

See [backend/README.md](backend/README.md) for the request and response contract.

## Project Docs

- [frontend/README.md](frontend/README.md)
- [backend/README.md](backend/README.md)
