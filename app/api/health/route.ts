import { NextResponse } from 'next/server';
import { checkDbConnection } from '@/lib/db';
import { isCloudinaryConfigured } from '@/lib/uploads';

export async function GET() {
  const dbCheck = await checkDbConnection();
  const uploadsConfigured = isCloudinaryConfigured() || process.env.NODE_ENV !== 'production';

  const requiredTables = [
    'admins',
    'site_content',
    'gallery',
    'intel_feeds',
    'chat_contacts',
    'chat_messages',
  ];

  const hasAllTables =
    dbCheck.ok &&
    dbCheck.tables &&
    requiredTables.every((t) => dbCheck.tables!.includes(t));

  const isHealthy = dbCheck.ok && Boolean(hasAllTables);

  const status = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      ok: isHealthy,
      database: dbCheck.ok,
      database_configured: dbCheck.configured,
      tables_ready: Boolean(hasAllTables),
      uploads: uploadsConfigured,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
