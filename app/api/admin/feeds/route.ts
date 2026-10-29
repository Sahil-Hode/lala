import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  createIntelFeed,
  updateIntelFeed,
  deleteIntelFeed,
} from '@/lib/queries';
import { validateThreatLevel } from '@/lib/validation';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = body.action || 'save';

    if (action === 'delete') {
      const id = Number(body.id);
      if (!id) return NextResponse.json({ success: false, error: 'ID is required.' }, { status: 400 });
      await deleteIntelFeed(id);
      return NextResponse.json({ success: true, message: 'Feed removed.' });
    }

    const id = Number(body.id || 0);
    const title = String(body.title || '').trim();
    const feedBody = String(body.body || '').trim();
    const threatLevel = validateThreatLevel(body.threat_level || 'medium');
    const isActive = body.is_active === true || body.is_active === 1 || body.is_active === '1';

    if (!title || !feedBody) {
      return NextResponse.json(
        { success: false, error: 'Title and body are required.' },
        { status: 400 }
      );
    }

    if (id > 0) {
      await updateIntelFeed(id, {
        title,
        body: feedBody,
        threat_level: threatLevel,
        is_active: isActive,
      });
      return NextResponse.json({ success: true, message: 'Feed updated.' });
    } else {
      await createIntelFeed({
        title,
        body: feedBody,
        threat_level: threatLevel,
        is_active: isActive,
      });
      return NextResponse.json({ success: true, message: 'Feed published to stream.' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Feed operation failed.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
