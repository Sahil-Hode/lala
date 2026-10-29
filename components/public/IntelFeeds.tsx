import { IntelFeed } from '@/types/database';

interface IntelFeedsProps {
  title: string;
  feeds: IntelFeed[];
}

function threatClass(level: string): string {
  switch (level.toLowerCase()) {
    case 'critical':
      return 'threat-critical';
    case 'high':
      return 'threat-high';
    case 'medium':
      return 'threat-medium';
    default:
      return 'threat-low';
  }
}

function formatFeedTime(dateStr: string | Date): string {
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? String(dateStr) : d.toISOString().replace('T', ' ').substring(0, 16) + ' Z';
  } catch {
    return String(dateStr);
  }
}

export default function IntelFeeds({ title, feeds }: IntelFeedsProps) {
  return (
    <section className="section" id="intel">
      <div className="section-head reveal">
        <p className="section-kicker">04 // STREAM</p>
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="feeds reveal">
        {feeds.length === 0 ? (
          <div className="feed">
            <div className="feed-body">No active intel.</div>
          </div>
        ) : (
          feeds.map((feed) => (
            <article key={feed.id} className="feed">
              <div className={`feed-level ${threatClass(feed.threat_level)}`}>
                ● {feed.threat_level.toUpperCase()}
              </div>
              <div>
                <h3 className="feed-title">{feed.title}</h3>
                <p className="feed-body">{feed.body}</p>
                <div className="feed-time">{formatFeedTime(feed.created_at)}</div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
