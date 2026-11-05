# CivicPulse AI

CivicPulse AI is a React/Vite citizen reporting app with an Express, JWT, and MongoDB API. Gemini image analysis is called by the Express server; the browser never receives the Gemini API key.

## Run locally

Prerequisites: Node.js, MongoDB, and a Gemini API key.

1. Copy `.env.example` to `.env`. Set `MONGODB_URI`, a strong `JWT_SECRET`, and `GEMINI_API_KEY`. Gemini calls are made only by the API server.
2. Install dependencies with `npm install`.
3. Initialize the three fixed demo accounts with `npm run server:seed`.
4. Start the API with `npm run server:dev`.
5. In another terminal, start Vite with `npm run dev`.

The demo accounts are `citizen@civicai.com`, `admin@civicai.com`, and `officer@civicai.com`. Their passwords are initialized by the backend seed script and are not included in frontend source.

## Phase 4 AI endpoints

Both endpoints require a valid citizen JWT and accept a raw JPEG, PNG, or WEBP request body (`Content-Type: image/jpeg`, `image/png`, or `image/webp`), up to 10 MB:

- `POST /api/ai/analyze-image` - Gemini Vision returns structured civic issue detection, category, severity and department recommendations, confidence, suggested action, and manual-review status. If no civic issue is recognizable, it reports that rather than inventing a classification.
- `POST /api/ai/spotguard` - Gemini analyzes visible conditions and potential risks, returns INR cost estimates, materials, implementation and maintenance guidance, and permissions/access notes, then asks the configured Gemini image model for a conceptual preview based on the uploaded scene.

Configure `GEMINI_VISION_MODEL` and `GEMINI_IMAGE_MODEL` to select available Gemini models. The defaults are `gemini-2.5-flash` and `gemini-2.5-flash-image`. AI requests fail explicitly if `GEMINI_API_KEY` is missing or Gemini cannot return a valid result; the application does not replace failures with sample predictions.

The original complaint photograph is currently included in the MongoDB complaint document, so uploads are limited to 10 MB to remain within MongoDB's document-size limit. SpotGuard images and generated previews are held in the browser response and are not yet persisted as reusable image URLs. Durable image hosting and notifications remain future work.

## Checks

- `npm run lint` - TypeScript check.
- `npm run build` - Vite production build.
