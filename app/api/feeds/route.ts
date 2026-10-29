import { NextResponse } from 'next/server';
import { getIntelFeeds } from '@/lib/queries';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('all') !== 'true';

    const data = await getIntelFeeds(activeOnly);
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch feeds.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
