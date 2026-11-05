import { createHash } from 'node:crypto';
import { cloudinaryConfigured, config } from './config';

export const storeImage = async (buffer: Buffer, mimeType: string): Promise<string> => {
  if (!cloudinaryConfigured) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Persistent image storage is not configured. Set the Cloudinary environment variables.');
    }
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = 'civicpulse';
  const signatureBase = `folder=${folder}&timestamp=${timestamp}${config.cloudinaryApiSecret}`;
  const signature = createHash('sha1').update(signatureBase).digest('hex');
  const form = new FormData();
  form.append('file', new Blob([Uint8Array.from(buffer)], { type: mimeType }), 'civicpulse-upload');
  form.append('api_key', config.cloudinaryApiKey!);
  form.append('timestamp', timestamp);
  form.append('folder', folder);
  form.append('signature', signature);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudinaryCloudName!)}/image/upload`,
      { method: 'POST', body: form, signal: controller.signal },
    );
    if (!response.ok) {
      throw new Error(`Cloudinary image upload failed (HTTP ${response.status}).`);
    }
    const result: unknown = await response.json();
    if (!result || typeof result !== 'object' || !('secure_url' in result) || typeof result.secure_url !== 'string') {
      throw new Error('Cloudinary returned an invalid image URL.');
    }
    return result.secure_url;
  } finally {
    clearTimeout(timeout);
  }
};
