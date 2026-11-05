# CivicPulse AI

CivicPulse AI is a React/Vite civic reporting app backed by an Express API, MongoDB, JWT authentication, bcrypt password hashing, and Gemini image analysis. The browser never receives the Gemini or Cloudinary secrets.

## Run locally

Prerequisites: Node.js 20.19+ or 22.12+, MongoDB, and (for AI) a Gemini API key.

1. Copy `.env.example` to `.env`. Configure `MONGODB_URI`, a strong `JWT_SECRET`, and `GEMINI_API_KEY`. Cloudinary is optional for local work; local images are stored as MongoDB data URLs when it is not configured.
2. Install dependencies with `npm install`.
3. Initialize the fixed demo accounts with `npm run server:seed`. The seed is idempotent and preserves existing passwords.
4. Start the API with `npm run server:dev`.
5. In another terminal, start Vite with `npm run dev`.

The fixed demo accounts are:

- Citizen: `citizen@civicai.com`
- Admin: `admin@civicai.com`
- Officer: `officer@civicai.com`

Their passwords are initialized by the backend seed script and are not included in frontend source. New residents can register through the API. Administrators can add officer accounts and assign a department from the user directory.

## API and images

- `GET /health` checks API readiness.
- `/api/auth` handles registration, login, and session restoration.
- `/api/uploads/image` validates and stores JPEG, PNG, or WEBP uploads (10 MB max).
- `/api/ai/analyze-image` and `/api/ai/spotguard` require a citizen JWT and accept JPEG, PNG, or WEBP uploads (10 MB max).
- `/api/complaints`, `/api/admin`, `/api/department`, and `/api/notifications` provide the authenticated complaint lifecycle.

Gemini uses `gemini-2.5-flash` for image understanding and `gemini-2.5-flash-image` for conceptual image generation by default. AI output is schema-validated; requests fail explicitly if the configured model cannot provide the requested result. SpotGuard recommendations describe visible conditions and possible risks, not unobserved events. Its generated preview is labeled conceptual and is not proof of completed work.

Set all three Cloudinary variables to use persistent hosted images. Production startup requires Cloudinary, MongoDB Atlas, a strong JWT secret, and an explicit CORS origin. Generated SpotGuard analysis records and image URLs are saved to MongoDB. Email is not configured; user notifications are in-app database records.

## Checks

- `npm run lint` - TypeScript validation.
- `npm run build` - Vite production build.
- `npm run server:build` - bundle the Express API for deployment.
- `npm run server:start` - start the bundled API.

## Deploy

The repository includes `render.yaml` for the Express API and `vercel.json` for Vite SPA route fallback. Deployment requires accounts/configuration in Render, Vercel, MongoDB Atlas, Cloudinary, and (for AI) Google AI Studio. No live deployment is created by these files alone.

1. Create a MongoDB Atlas database and database user. Allow connections from the chosen API host and prepare its connection URI.
2. Create a Cloudinary account and collect its cloud name, API key, and API secret.
3. Import this repository into Render using the included blueprint. Set `MONGODB_URI`, `CORS_ORIGIN`, and Cloudinary credentials in Render's environment settings. Add `GEMINI_API_KEY` there if AI features are required. Keep secrets in provider settings; do not put them in Vite variables or source control. The blueprint generates `JWT_SECRET`.
4. Deploy the API. The Render health URL is `https://<render-service>.onrender.com/health`.
5. Import the repository into Vercel as a Vite project. Set `VITE_API_URL` to `https://<render-service>.onrender.com/api` and deploy.
6. Set Render's `CORS_ORIGIN` to the exact Vercel origin (for example `https://<project>.vercel.app`; comma-separate additional trusted origins), then redeploy the API.
7. Seed demo accounts against Atlas from a secure local terminal after setting the Atlas URI in the ignored local `.env`: `npm run server:seed`. Never commit `.env`.
8. Verify the API health URL and test all three logins and the complaint lifecycle on the public Vercel URL.

The live URLs are assigned by Vercel and Render after deployment and must be filled into the steps above. No publicly accessible URL is claimed until these provider deployments are completed and verified.
