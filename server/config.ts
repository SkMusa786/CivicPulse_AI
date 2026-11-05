import 'dotenv/config';

const required = (name: string, fallback?: string): string => {
  const value = process.env[name] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const isProduction = process.env.NODE_ENV === 'production';
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const jwtSecret = process.env.JWT_SECRET?.trim();
if (isProduction && (!jwtSecret || jwtSecret.length < 32 || jwtSecret === 'replace-with-a-long-random-secret' || jwtSecret === 'development-only-change-me')) {
  throw new Error('Set a strong JWT_SECRET before starting the API in production.');
}
if (!isProduction && !jwtSecret) {
  console.warn('JWT_SECRET is unset; using the development-only secret. Configure JWT_SECRET in .env.');
}
if (isProduction && !process.env.MONGODB_URI?.trim()) {
  throw new Error('Set MONGODB_URI to the production MongoDB Atlas database before starting the API.');
}
if (isProduction && !process.env.CORS_ORIGIN?.trim()) {
  throw new Error('Set CORS_ORIGIN to the deployed frontend origin before starting the API.');
}
if (isProduction && corsOrigins.length === 0) {
  throw new Error('CORS_ORIGIN must contain at least one valid frontend origin.');
}
if (
  isProduction &&
  (!process.env.CLOUDINARY_CLOUD_NAME?.trim() ||
    !process.env.CLOUDINARY_API_KEY?.trim() ||
    !process.env.CLOUDINARY_API_SECRET?.trim())
) {
  throw new Error('Set all Cloudinary credentials before starting the API in production.');
}

export const config = {
  port: Number(process.env.PORT || 5000),
  mongoUri: required('MONGODB_URI', isProduction ? undefined : 'mongodb://127.0.0.1:27017/civicpulse'),
  jwtSecret: jwtSecret || 'development-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  corsOrigins,
  geminiApiKey: process.env.GEMINI_API_KEY?.trim() || undefined,
  geminiVisionModel: process.env.GEMINI_VISION_MODEL || 'gemini-2.5-flash',
  geminiImageModel: process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim() || undefined,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY?.trim() || undefined,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET?.trim() || undefined,
};

export const cloudinaryConfigured = Boolean(
  config.cloudinaryCloudName && config.cloudinaryApiKey && config.cloudinaryApiSecret,
);
