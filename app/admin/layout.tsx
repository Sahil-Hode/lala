import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NEXUS — Control & Administration',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-body">{children}</div>;
}
