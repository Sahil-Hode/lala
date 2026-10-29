import AdminShell from '@/components/admin/AdminShell';
import ChatManager from '@/components/admin/ChatManager';
import { getSession } from '@/lib/auth';
import { getChatContacts, getChatMessages } from '@/lib/queries';


export default async function AdminChatsPage() {
  const session = await getSession();
  const [contacts, messages] = await Promise.all([
    getChatContacts(false),
    getChatMessages(),
  ]);

  return (
    <AdminShell pageTitle="WhatsApp Chats" username={session?.username || 'admin'}>
      <ChatManager initialContacts={contacts} initialMessages={messages} />
    </AdminShell>
  );
}
