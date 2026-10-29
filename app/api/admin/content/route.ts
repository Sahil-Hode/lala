import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { updateMultipleSiteContent } from '@/lib/queries';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const content = body.content as Record<string, string>;
    if (!content || typeof content !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid content data.' }, { status: 400 });
    }

    await updateMultipleSiteContent(content);
    return NextResponse.json({
      success: true,
      message: 'Content uplink successful — front site updated.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update content.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
