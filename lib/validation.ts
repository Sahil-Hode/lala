export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export function validateImageFile(file: File): { ok: boolean; error?: string } {
  if (!file) {
    return { ok: false, error: 'No file provided.' };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: 'File size exceeds 5MB limit.' };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      ok: false,
      error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF.`,
    };
  }
  return { ok: true };
}

export function sanitizeText(val: unknown): string {
  if (typeof val !== 'string') return '';
  return val.trim();
}

export function validateThreatLevel(val: string): 'low' | 'medium' | 'high' | 'critical' {
  const allowed = ['low', 'medium', 'high', 'critical'] as const;
  const lower = val.toLowerCase();
  for (const item of allowed) {
    if (item === lower) return item;
  }
  return 'medium';
}
