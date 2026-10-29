import AdminShell from '@/components/admin/AdminShell';
import DashboardCards from '@/components/admin/DashboardCards';
import { getSession } from '@/lib/auth';
import {
  getAllSiteContent,
  getGalleryItems,
  getIntelFeeds,
  getChatContacts,
} from '@/lib/queries';


export default async function AdminDashboardPage() {
  const session = await getSession();

  const [content, gallery, feeds, contacts] = await Promise.all([
    getAllSiteContent(),
    getGalleryItems(false),
    getIntelFeeds(false),
    getChatContacts(false),
  ]);

  return (
    <AdminShell pageTitle="Command Overview" username={session?.username || 'admin'}>
      <DashboardCards
        contentCount={content.length}
        galleryCount={gallery.length}
        feedCount={feeds.length}
        chatCount={contacts.length}
      />
    </AdminShell>
  );
}
