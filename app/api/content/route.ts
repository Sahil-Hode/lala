import { NextResponse } from 'next/server';
import { getSiteContent, getContentBySection } from '@/lib/queries';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const grouped = searchParams.get('grouped') === 'true';

    if (grouped) {
      const data = await getContentBySection();
      return NextResponse.json({ success: true, data });
    }

    const data = await getSiteContent();
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch content.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
