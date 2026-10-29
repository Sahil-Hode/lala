import AdminShell from '@/components/admin/AdminShell';
import ContentEditor from '@/components/admin/ContentEditor';
import { getSession } from '@/lib/auth';
import { getContentBySection } from '@/lib/queries';


export default async function AdminContentPage() {
  const session = await getSession();
  const grouped = await getContentBySection();

  return (
    <AdminShell pageTitle="Site Content" username={session?.username || 'admin'}>
      <ContentEditor initialGrouped={grouped} />
    </AdminShell>
  );
}
