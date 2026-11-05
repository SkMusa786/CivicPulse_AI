import 'dotenv/config';

const required = (name: string, fallback?: string): string => {
  const value = process.env[name] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET?.trim();
if (isProduction && (!jwtSecret || jwtSecret === 'replace-with-a-long-random-secret' || jwtSecret === 'development-only-change-me')) {
  throw new Error('Set a strong JWT_SECRET before starting the API in production.');
}
if (!isProduction && !jwtSecret) {
  console.warn('JWT_SECRET is unset; using the development-only secret. Configure JWT_SECRET in .env.');
}

export const config = {
  port: Number(process.env.PORT || 5000),
  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/civicpulse'),
  jwtSecret: jwtSecret || 'development-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  geminiApiKey: process.env.GEMINI_API_KEY?.trim() || undefined,
  geminiVisionModel: process.env.GEMINI_VISION_MODEL || 'gemini-2.5-flash',
  geminiImageModel: process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image',
};
