import AdminShell from '@/components/admin/AdminShell';
import FeedManager from '@/components/admin/FeedManager';
import { getSession } from '@/lib/auth';
import { getIntelFeeds } from '@/lib/queries';


export default async function AdminFeedsPage() {
  const session = await getSession();
  const feeds = await getIntelFeeds(false);

  return (
    <AdminShell pageTitle="Intel Feeds" username={session?.username || 'admin'}>
      <FeedManager initialFeeds={feeds} />
    </AdminShell>
  );
}
