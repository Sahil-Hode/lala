import { validateImageFile } from './validation';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const validation = validateImageFile(file);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // If Cloudinary is configured, use its REST API
  if (isCloudinaryConfigured()) {
    try {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
      const apiKey = process.env.CLOUDINARY_API_KEY!;
      const apiSecret = process.env.CLOUDINARY_API_SECRET!;
      const timestamp = Math.floor(Date.now() / 1000);

      const signStr = `folder=nexus_uploads&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signStr).digest('hex');

      const formData = new FormData();
      const blob = new Blob([buffer], { type: file.type });
      formData.append('file', blob);
      formData.append('api_key', apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      formData.append('folder', 'nexus_uploads');

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );

      const json = await res.json();
      if (res.ok && json.secure_url) {
        return { success: true, url: json.secure_url };
      } else {
        return {
          success: false,
          error: json.error?.message || 'Cloudinary upload failed.',
        };
      }
    } catch (err: unknown) {
      console.error('[Upload] Cloudinary error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Upload service unavailable.',
      };
    }
  }

  // Local filesystem or Serverless Data-URL Fallback
  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  const ext = extMap[file.type] || 'jpg';
  const randomHex = crypto.randomBytes(8).toString('hex');
  const filename = `img_${randomHex}.${ext}`;

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const fullPath = path.join(uploadDir, filename);
    await fs.writeFile(fullPath, buffer);
    return { success: true, url: `/uploads/${filename}` };
  } catch (fsErr) {
    // If running in a read-only serverless environment and no Cloudinary is set,
    // fallback to a clean base64 data URL so nothing breaks.
    console.warn('[Upload] Filesystem not writable, fallback to base64 data URL:', fsErr);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;
    return { success: true, url: dataUrl };
  }
}
