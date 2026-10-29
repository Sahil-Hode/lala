import AdminShell from '@/components/admin/AdminShell';
import GalleryManager from '@/components/admin/GalleryManager';
import { getSession } from '@/lib/auth';
import { getGalleryItems } from '@/lib/queries';


export default async function AdminGalleryPage() {
  const session = await getSession();
  const items = await getGalleryItems(false);

  return (
    <AdminShell pageTitle="Surveillance Gallery" username={session?.username || 'admin'}>
      <GalleryManager initialItems={items} />
    </AdminShell>
  );
}
