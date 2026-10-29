import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  createChatContact,
  updateChatContact,
  deleteChatContact,
  createChatMessage,
  updateChatMessage,
  deleteChatMessage,
} from '@/lib/queries';
import { uploadImage } from '@/lib/uploads';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const action = String(formData.get('action') || '');

      if (action === 'delete_contact') {
        const id = Number(formData.get('id'));
        if (!id) return NextResponse.json({ success: false, error: 'ID is required.' }, { status: 400 });
        await deleteChatContact(id);
        return NextResponse.json({ success: true, message: 'Contact purged.' });
      }

      if (action === 'delete_message') {
        const id = Number(formData.get('id'));
        if (!id) return NextResponse.json({ success: false, error: 'ID is required.' }, { status: 400 });
        await deleteChatMessage(id);
        return NextResponse.json({ success: true, message: 'Message removed.' });
      }

      if (action === 'save_contact') {
        const id = Number(formData.get('id') || 0);
        const name = String(formData.get('name') || '').trim();
        const phone = String(formData.get('phone') || '').trim();
        const statusText = String(formData.get('status_text') || 'online').trim();
        const lastSeen = String(formData.get('last_seen') || 'online').trim();
        const avatarColor = String(formData.get('avatar_color') || '#00a884').trim();
        const sortOrder = Number(formData.get('sort_order') || 0);
        const isActive = formData.get('is_active') === '1' || formData.get('is_active') === 'true';
        const avatarFile = formData.get('avatar') as File | null;

        if (!name) {
          return NextResponse.json({ success: false, error: 'Name is required.' }, { status: 400 });
        }

        let avatarPath: string | null = null;
        if (avatarFile && avatarFile.size > 0) {
          const uploadRes = await uploadImage(avatarFile);
          if (!uploadRes.success || !uploadRes.url) {
            return NextResponse.json({ success: false, error: uploadRes.error || 'Avatar upload failed.' }, { status: 400 });
          }
          avatarPath = uploadRes.url;
        }

        if (id > 0) {
          await updateChatContact(id, {
            name,
            phone,
            status_text: statusText,
            last_seen: lastSeen,
            avatar_color: avatarColor,
            sort_order: sortOrder,
            is_active: isActive,
            ...(avatarPath ? { avatar_path: avatarPath } : {}),
          });
          return NextResponse.json({ success: true, message: 'Contact updated.' });
        } else {
          await createChatContact({
            name,
            phone,
            status_text: statusText,
            last_seen: lastSeen,
            avatar_color: avatarColor,
            sort_order: sortOrder,
            is_active: isActive,
            avatar_path: avatarPath,
          });
          return NextResponse.json({ success: true, message: 'Contact added.' });
        }
      }

      if (action === 'save_message') {
        const id = Number(formData.get('id') || 0);
        const contactId = Number(formData.get('contact_id'));
        const sender = (formData.get('sender') === 'me' ? 'me' : 'them') as 'them' | 'me';
        const message = String(formData.get('message') || '').trim();
        const sentAt = String(formData.get('sent_at') || new Date().toISOString());
        const sortOrder = Number(formData.get('sort_order') || 0);

        if (!contactId || !message) {
          return NextResponse.json({ success: false, error: 'Contact and message are required.' }, { status: 400 });
        }

        if (id > 0) {
          await updateChatMessage(id, {
            contact_id: contactId,
            sender,
            message,
            sent_at: sentAt,
            sort_order: sortOrder,
          });
          return NextResponse.json({ success: true, message: 'Message updated.' });
        } else {
          await createChatMessage({
            contact_id: contactId,
            sender,
            message,
            sent_at: sentAt,
            sort_order: sortOrder,
          });
          return NextResponse.json({ success: true, message: 'Message logged.' });
        }
      }
    } else {
      const body = await request.json();
      const action = body.action;

      if (action === 'delete_contact') {
        await deleteChatContact(Number(body.id));
        return NextResponse.json({ success: true, message: 'Contact purged.' });
      }
      if (action === 'delete_message') {
        await deleteChatMessage(Number(body.id));
        return NextResponse.json({ success: true, message: 'Message removed.' });
      }
      if (action === 'save_contact') {
        const { id, name, phone, status_text, last_seen, avatar_color, sort_order, is_active, avatar_path } = body;
        if (!name) return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
        if (id) {
          await updateChatContact(Number(id), { name, phone, status_text, last_seen, avatar_color, sort_order: Number(sort_order), is_active: Boolean(is_active), avatar_path });
          return NextResponse.json({ success: true, message: 'Contact updated.' });
        } else {
          await createChatContact({ name, phone, status_text, last_seen, avatar_color, sort_order: Number(sort_order), is_active: Boolean(is_active), avatar_path });
          return NextResponse.json({ success: true, message: 'Contact added.' });
        }
      }
      if (action === 'save_message') {
        const { id, contact_id, sender, message, sent_at, sort_order } = body;
        if (!contact_id || !message) return NextResponse.json({ success: false, error: 'Contact & message required' }, { status: 400 });
        if (id) {
          await updateChatMessage(Number(id), { contact_id: Number(contact_id), sender, message, sent_at, sort_order: Number(sort_order) });
          return NextResponse.json({ success: true, message: 'Message updated.' });
        } else {
          await createChatMessage({ contact_id: Number(contact_id), sender, message, sent_at, sort_order: Number(sort_order) });
          return NextResponse.json({ success: true, message: 'Message logged.' });
        }
      }
    }

    return NextResponse.json({ success: false, error: 'Unrecognized action.' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Chat operation failed.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
