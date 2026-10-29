'use client';

import { useState } from 'react';
import { IntelFeed } from '@/types/database';
import { ThreatLevel } from '@/types/feed';

interface FeedManagerProps {
  initialFeeds: IntelFeed[];
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
    return isNaN(d.getTime())
      ? String(dateStr)
      : d.toISOString().replace('T', ' ').substring(0, 16);
  } catch {
    return String(dateStr);
  }
}

export default function FeedManager({ initialFeeds }: FeedManagerProps) {
  const [feeds, setFeeds] = useState<IntelFeed[]>(initialFeeds);
  const [editingFeed, setEditingFeed] = useState<IntelFeed | null>(null);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>('medium');
  const [isActive, setIsActive] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);

  const resetForm = () => {
    setEditingFeed(null);
    setTitle('');
    setBody('');
    setThreatLevel('medium');
    setIsActive(true);
  };

  const handleEditClick = (feed: IntelFeed) => {
    setEditingFeed(feed);
    setTitle(feed.title);
    setBody(feed.body);
    setThreatLevel(feed.threat_level);
    setIsActive(Boolean(feed.is_active));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const refreshFeeds = async () => {
    try {
      const res = await fetch('/api/feeds?all=true');
      const data = await res.json();
      if (res.ok && data.success) {
        setFeeds(data.data);
      }
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFlash(null);

    try {
      const res = await fetch('/api/admin/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          id: editingFeed?.id || 0,
          title,
          body,
          threat_level: threatLevel,
          is_active: isActive,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setFlash({ type: 'ok', message: data.message || 'Feed saved.' });
        resetForm();
        await refreshFeeds();
      } else {
        setFlash({ type: 'err', message: data.error || 'Failed to save feed.' });
      }
    } catch (err: unknown) {
      setFlash({ type: 'err', message: err instanceof Error ? err.message : 'Error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Remove this feed?')) return;
    setLoading(true);
    setFlash(null);

    try {
      const res = await fetch('/api/admin/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setFlash({ type: 'ok', message: 'Feed removed.' });
        if (editingFeed?.id === id) resetForm();
        await refreshFeeds();
      } else {
        setFlash({ type: 'err', message: data.error || 'Failed to delete feed.' });
      }
    } catch (err: unknown) {
      setFlash({ type: 'err', message: err instanceof Error ? err.message : 'Error.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {flash && (
        <div className={`flash ${flash.type === 'ok' ? 'ok' : 'err'}`}>
          {flash.message}
        </div>
      )}

      <div className="form-panel">
        <h2>{editingFeed ? `EDIT FEED #${editingFeed.id}` : 'BROADCAST NEW FEED'}</h2>
        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label>Body</label>
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          <div className="grid-2">
            <div>
              <label>Threat Level</label>
              <select
                value={threatLevel}
                onChange={(e) => setThreatLevel(e.target.value as ThreatLevel)}
              >
                {(['low', 'medium', 'high', 'critical'] as ThreatLevel[]).map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Live on front site
              </label>
            </div>
          </div>

          <div className="actions">
            <button className="btn" type="submit" disabled={loading}>
              {loading
                ? 'BROADCASTING...'
                : editingFeed
                ? 'UPDATE FEED →'
                : 'PUBLISH FEED →'}
            </button>
            {editingFeed && (
              <button className="btn btn-ghost" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Level</th>
              <th>Title</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {feeds.length === 0 ? (
              <tr>
                <td colSpan={5}>No feeds broadcast yet.</td>
              </tr>
            ) : (
              feeds.map((feed) => (
                <tr key={feed.id}>
                  <td className={threatClass(feed.threat_level)}>
                    {feed.threat_level.toUpperCase()}
                  </td>
                  <td>
                    <strong>{feed.title}</strong>
                    <br />
                    <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                      {feed.body.length > 90 ? feed.body.substring(0, 90) + '…' : feed.body}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${feed.is_active ? 'on' : 'off'}`}>
                      {feed.is_active ? 'LIVE' : 'HIDDEN'}
                    </span>
                  </td>
                  <td>{formatFeedTime(feed.created_at)}</td>
                  <td className="actions">
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => handleEditClick(feed)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      type="button"
                      onClick={() => handleDelete(feed.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
