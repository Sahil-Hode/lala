import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
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
      const action = String(formData.get('action') || 'save');

      if (action === 'delete') {
        const id = Number(formData.get('id'));
        if (!id) return NextResponse.json({ success: false, error: 'ID is required.' }, { status: 400 });
        await deleteGalleryItem(id);
        return NextResponse.json({ success: true, message: 'Asset purged.' });
      }

      const id = Number(formData.get('id') || 0);
      const title = String(formData.get('title') || '').trim();
      const description = String(formData.get('description') || '').trim();
      const category = String(formData.get('category') || 'ops').trim();
      const sortOrder = Number(formData.get('sort_order') || 0);
      const isActive = formData.get('is_active') === '1' || formData.get('is_active') === 'true';
      const imageFile = formData.get('image') as File | null;

      if (!title) {
        return NextResponse.json({ success: false, error: 'Title is required.' }, { status: 400 });
      }

      let imagePath = '';
      if (imageFile && imageFile.size > 0) {
        const uploadRes = await uploadImage(imageFile);
        if (!uploadRes.success || !uploadRes.url) {
          return NextResponse.json({ success: false, error: uploadRes.error || 'Image upload failed.' }, { status: 400 });
        }
        imagePath = uploadRes.url;
      }

      if (id > 0) {
        await updateGalleryItem(id, {
          title,
          description,
          category,
          sort_order: sortOrder,
          is_active: isActive,
          ...(imagePath ? { image_path: imagePath } : {}),
        });
        return NextResponse.json({ success: true, message: 'Asset updated.' });
      } else {
        if (!imagePath) {
          return NextResponse.json({ success: false, error: 'Image is required for new assets.' }, { status: 400 });
        }
        await createGalleryItem({
          title,
          description,
          category,
          sort_order: sortOrder,
          is_active: isActive,
          image_path: imagePath,
        });
        return NextResponse.json({ success: true, message: 'Asset uploaded to gallery.' });
      }
    } else {
      const body = await request.json();
      const { action, id, title, description, category, sort_order, is_active, image_path } = body;

      if (action === 'delete') {
        if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
        await deleteGalleryItem(Number(id));
        return NextResponse.json({ success: true, message: 'Asset purged.' });
      }

      if (id) {
        await updateGalleryItem(Number(id), {
          title,
          description,
          category,
          sort_order: Number(sort_order),
          is_active: Boolean(is_active),
          image_path,
        });
        return NextResponse.json({ success: true, message: 'Asset updated.' });
      } else {
        await createGalleryItem({
          title,
          description,
          category,
          sort_order: Number(sort_order),
          is_active: Boolean(is_active),
          image_path: image_path || '/assets/uploads/placeholder-soc.svg',
        });
        return NextResponse.json({ success: true, message: 'Asset created.' });
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gallery operation failed.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
