# Backend

Express API for generating structured safety reflection responses with Gemini.

## Stack

- Express 5
- Zod
- `@google/genai`
- Morgan
- Helmet
- CORS

## Scripts

```bash
npm run dev
npm start
```

## Environment Variables

Create `.env` from `.env.example`.

```env
PORT=4000
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-2.5-flash
```

## Run Locally

```bash
npm install
npm run dev
```

## API Endpoints

### `GET /api/health`

Health check endpoint.

### `POST /api/rewrite`

Generates a structured response from a user draft.

Request body:

```json
{
  "focusArea": "preventing_forecourt_fires",
  "customFocusArea": "",
  "draft": "Draft text here"
}
```

Valid `focusArea` values:

- `preventing_forecourt_fires`
- `thinking_of_the_forecourt_as_a_road`
- `leading_contractor_management`
- `managing_security`
- `responding_in_an_emergency`
- `looking_after_my_wellbeing`
- `maintaining_a_strong_food_safety_culture`
- `others`

Response shape:

```json
{
  "success": true,
  "data": {
    "model": "gemini-2.5-flash",
    "focusAreaLabel": "Preventing Forecourt Fires",
    "answers": {
      "intent": ["..."],
      "learning": ["..."],
      "reflection": ["..."],
      "safetyLeadershipPrinciples": ["..."]
    }
  }
}
```

## Structure

```text
src/
├── app.js
├── config/
├── controllers/
├── middlewares/
├── prompts/
├── routes/
├── services/
├── utils/
└── validators/
```

## Notes

- Environment variables are loaded from `backend/.env`
- CORS is restricted to `FRONTEND_URL`
- Gemini responses are validated again with Zod after generation
