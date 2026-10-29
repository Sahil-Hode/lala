import Link from 'next/link';

interface DashboardCardsProps {
  contentCount: number;
  galleryCount: number;
  feedCount: number;
  chatCount: number;
}

export default function DashboardCards({
  contentCount,
  galleryCount,
  feedCount,
  chatCount,
}: DashboardCardsProps) {
  return (
    <>
      <div className="dash-grid">
        <div className="dash-card">
          <div className="n">{contentCount}</div>
          <div className="l">TEXT FIELDS</div>
        </div>
        <div className="dash-card">
          <div className="n">{galleryCount}</div>
          <div className="l">SURVEILLANCE ASSETS</div>
        </div>
        <div className="dash-card">
          <div className="n">{feedCount}</div>
          <div className="l">INTEL FEEDS</div>
        </div>
        <div className="dash-card">
          <div className="n">{chatCount}</div>
          <div className="l">WHATSAPP CONTACTS</div>
        </div>
      </div>

      <div className="form-panel" style={{ marginTop: '1.5rem' }}>
        <h2>QUICK LINKS</h2>
        <div className="actions">
          <Link className="btn" href="/admin/content">
            Edit Site Text
          </Link>
          <Link className="btn" href="/admin/gallery">
            Manage Photos
          </Link>
          <Link className="btn" href="/admin/feeds">
            Manage Intel Feeds
          </Link>
          <Link className="btn" href="/admin/chats">
            WhatsApp Chats
          </Link>
          <Link className="btn btn-ghost" href="/" target="_blank">
            View Front Site ↗
          </Link>
        </div>
      </div>
    </>
  );
}
