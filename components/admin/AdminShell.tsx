import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminShellProps {
  pageTitle: string;
  username?: string;
  children: React.ReactNode;
}

export default function AdminShell({
  pageTitle,
  username = 'admin',
  children,
}: AdminShellProps) {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="main">
        <AdminHeader pageTitle={pageTitle} username={username} />
        {children}
      </main>
    </div>
  );
}
