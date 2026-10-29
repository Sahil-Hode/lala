'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">NEXUS CTRL</div>
      <Link href="/admin" className={pathname === '/admin' ? 'active' : ''}>
        Overview
      </Link>
      <Link href="/admin/content" className={pathname === '/admin/content' ? 'active' : ''}>
        Site Text
      </Link>
      <Link href="/admin/gallery" className={pathname === '/admin/gallery' ? 'active' : ''}>
        Photos
      </Link>
      <Link href="/admin/feeds" className={pathname === '/admin/feeds' ? 'active' : ''}>
        Intel Feeds
      </Link>
      <Link href="/admin/chats" className={pathname === '/admin/chats' ? 'active' : ''}>
        WhatsApp Chats
      </Link>
      <div className="spacer" />
      <Link href="/" target="_blank">
        Front Site ↗
      </Link>
      <a href="#logout" onClick={handleLogout}>
        Logout
      </a>
    </aside>
  );
}
