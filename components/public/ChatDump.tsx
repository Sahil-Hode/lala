'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { ChatThread } from '@/types/chat';

interface ChatDumpProps {
  chatTitle: string;
  chatSubtitle: string;
  sourcePhone: string;
  chatStatus: string;
  toolBanner: string;
  threads: ChatThread[];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');
  return initials || '?';
}

function formatChatTime(dateStr: string | Date | undefined): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return '';
  }
}

export default function ChatDump({
  chatTitle,
  chatSubtitle,
  sourcePhone,
  chatStatus,
  toolBanner,
  threads,
}: ChatDumpProps) {
  const [activeContactId, setActiveContactId] = useState<number | null>(null);
  const [mode, setMode] = useState<'list' | 'chat'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const threadRef = useRef<HTMLDivElement>(null);

  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads;
    const q = searchQuery.toLowerCase();
    return threads.filter((t) => t.name.toLowerCase().includes(q));
  }, [threads, searchQuery]);

  const activeContact = useMemo(() => {
    return threads.find((t) => t.id === activeContactId) || null;
  }, [threads, activeContactId]);

  const totalMessages = useMemo(() => {
    return threads.reduce((acc, t) => acc + (t.messages?.length || 0), 0);
  }, [threads]);

  const extractLabel = Math.max(totalMessages, threads.length).toLocaleString();

  const handleOpenChat = (id: number) => {
    setActiveContactId(id);
    setMode('chat');
  };

  useEffect(() => {
    if (mode === 'chat' && threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [mode, activeContactId]);

  return (
    <section className="section" id="comms">
      <div className="section-head reveal">
        <p className="section-kicker">05 // ENCRYPTED</p>
        <h2 className="section-title">{chatTitle}</h2>
        <p className="lead">{chatSubtitle}</p>
      </div>

      {threads.length === 0 ? (
        <p className="lead reveal">No active encrypted channels online.</p>
      ) : (
        <div className={`ds-frame ${mode === 'chat' ? 'mode-chat' : 'mode-list'} reveal`} id="ds-frame">
          <div className="ds-inner">
            <div className="ds-topbar">
              <div className="left">
                <span className="ds-dot" /> {chatStatus}
              </div>
              <div>{threads.length} CHATS</div>
            </div>

            {/* List View */}
            <div className="ds-list-view" id="ds-list-view">
              <div className="ds-wa-head">
                <div className="ds-wa-logo" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M17.5 14.4c-.3-.1-1.6-.8-1.8-.9-.2-.1-.4-.1-.6.1-.2.3-.6.9-.8 1.1-.1.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.5-1-.9-1.5-1.9-1.7-2.2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.1s.9 2.4 1.1 2.6c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.2.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3zM12.1 2C6.6 2 2.1 6.5 2.1 12c0 1.8.5 3.4 1.3 4.9L2 22l5.2-1.4c1.4.8 3.1 1.2 4.9 1.2 5.5 0 10-4.5 10-10S17.6 2 12.1 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3c-.8-1.4-1.3-2.9-1.3-4.5 0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5-3.8 8.4-8.5 8.4z" />
                  </svg>
                </div>
                <div className="ds-wa-titles">
                  <h3>WhatsApp Chats</h3>
                  <p>{`${sourcePhone} - Extracted`}</p>
                </div>
                <div className="ds-wa-actions" aria-hidden="true">
                  <span>⌕</span>
                  <span>⋮</span>
                </div>
              </div>

              <div className="ds-search">
                <label>
                  <span>⌕</span>
                  <input
                    type="search"
                    id="ds-search"
                    placeholder="Search or start new chat"
                    autoComplete="off"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </label>
              </div>

              <div className="ds-contacts" id="ds-contacts">
                {filteredThreads.map((contact) => {
                  const preview = (contact.preview || '').trim();
                  const previewShow = preview !== '' ? preview : 'Fetching chats';
                  const initials = getInitials(contact.name);
                  const avatarColor = contact.avatar_color || '#25d366';

                  return (
                    <button
                      key={contact.id}
                      type="button"
                      className="ds-contact"
                      onClick={() => handleOpenChat(contact.id)}
                    >
                      <div className="ds-avatar" style={{ background: avatarColor }}>
                        {contact.avatar_path ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={contact.avatar_path.startsWith('/') ? contact.avatar_path : `/${contact.avatar_path}`}
                            alt=""
                          />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="ds-contact-meta">
                        <div className="name">{contact.name}</div>
                        <div className={`preview ${preview !== '' ? 'has-text' : ''}`}>
                          {previewShow.length > 48 ? previewShow.substring(0, 48) + '…' : previewShow}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="ds-footer">
                <div className="ok">
                  <span className="check">✓</span> <span>{`${extractLabel} CHATS EXTRACTED SUCCESSFULLY`}</span>
                </div>
                <div className="meta">{`// ${toolBanner} - ${sourcePhone}`}</div>
              </div>
            </div>

            {/* Chat View */}
            <div className="ds-chat-view" id="ds-chat-view">
              <div className="ds-chat-bar">
                <button
                  type="button"
                  className="ds-back"
                  id="ds-back"
                  onClick={() => setMode('list')}
                >
                  ← BACK
                </button>
                <div
                  className="ds-avatar"
                  id="ds-active-avatar"
                  style={{
                    background: activeContact?.avatar_color || '#25d366',
                    width: 36,
                    height: 36,
                    fontSize: '0.8rem',
                  }}
                >
                  {activeContact?.avatar_path ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={activeContact.avatar_path.startsWith('/') ? activeContact.avatar_path : `/${activeContact.avatar_path}`}
                      alt=""
                    />
                  ) : (
                    getInitials(activeContact?.name || '')
                  )}
                </div>
                <div className="info">
                  <div className="name" id="ds-active-name">
                    {activeContact?.name || '—'}
                  </div>
                  <div className="status" id="ds-active-status">
                    {activeContact?.last_seen || 'extracted'}
                  </div>
                </div>
              </div>

              <div className="ds-thread" id="ds-thread" ref={threadRef}>
                {!activeContact || !activeContact.messages || activeContact.messages.length === 0 ? (
                  <div className="ds-empty">No messages recovered for this chat.</div>
                ) : (
                  activeContact.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`ds-bubble-row ${msg.sender === 'me' ? 'out' : 'in'}`}
                    >
                      <div className={`ds-bubble ${msg.sender === 'me' ? 'out' : 'in'}`}>
                        {msg.message}
                        <div className="meta">
                          <span>{formatChatTime(msg.sent_at)}</span>
                          {msg.sender === 'me' && <span>✓✓</span>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="ds-footer">
                <div className="ok">
                  <span className="check">✓</span> <span>CHAT DUMP DECRYPTED</span>
                </div>
                <div className="meta">{`// ${toolBanner} - ${sourcePhone}`}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
