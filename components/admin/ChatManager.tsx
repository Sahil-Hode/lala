'use client';

import { useState } from 'react';
import { ChatContact, ChatMessage } from '@/types/database';

interface ChatManagerProps {
  initialContacts: ChatContact[];
  initialMessages: (ChatMessage & { contact_name?: string })[];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');
  return initials || '?';
}

function formatDatetimeLocal(dateStr?: string | Date): string {
  try {
    const d = dateStr ? new Date(dateStr) : new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

export default function ChatManager({
  initialContacts,
  initialMessages,
}: ChatManagerProps) {
  const [tab, setTab] = useState<'contacts' | 'messages'>('contacts');
  const [contacts, setContacts] = useState<ChatContact[]>(initialContacts);
  const [messages, setMessages] = useState<(ChatMessage & { contact_name?: string })[]>(initialMessages);
  const [filterContactId, setFilterContactId] = useState<number | null>(null);

  // Contact form state
  const [editingContact, setEditingContact] = useState<ChatContact | null>(null);
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cStatus, setCStatus] = useState('online');
  const [cLastSeen, setCLastSeen] = useState('online');
  const [cAvatarColor, setCAvatarColor] = useState('#00a884');
  const [cSort, setCSort] = useState(0);
  const [cActive, setCActive] = useState(true);
  const [cAvatarFile, setCAvatarFile] = useState<File | null>(null);

  // Message form state
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [mContactId, setMContactId] = useState<number>(initialContacts[0]?.id || 1);
  const [mSender, setMSender] = useState<'them' | 'me'>('them');
  const [mMessage, setMMessage] = useState('');
  const [mSentAt, setMSentAt] = useState(formatDatetimeLocal());
  const [mSort, setMSort] = useState(0);

  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);

  const resetContactForm = () => {
    setEditingContact(null);
    setCName('');
    setCPhone('');
    setCStatus('online');
    setCLastSeen('online');
    setCAvatarColor('#00a884');
    setCSort(0);
    setCActive(true);
    setCAvatarFile(null);
    const fileInput = document.getElementById('contact-avatar-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleEditContact = (c: ChatContact) => {
    setEditingContact(c);
    setCName(c.name);
    setCPhone(c.phone || '');
    setCStatus(c.status_text || 'online');
    setCLastSeen(c.last_seen || 'online');
    setCAvatarColor(c.avatar_color || '#00a884');
    setCSort(c.sort_order || 0);
    setCActive(Boolean(c.is_active));
    setCAvatarFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetMessageForm = () => {
    setEditingMessage(null);
    setMMessage('');
    setMSentAt(formatDatetimeLocal());
    setMSort(0);
  };

  const handleEditMessage = (m: ChatMessage) => {
    setEditingMessage(m);
    setMContactId(m.contact_id);
    setMSender(m.sender);
    setMMessage(m.message);
    setMSentAt(formatDatetimeLocal(m.sent_at));
    setMSort(m.sort_order || 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const refreshData = async () => {
    try {
      const res = await fetch('/api/chats?all=true');
      const data = await res.json();
      if (res.ok && data.success) {
        const threads = data.data;
        const allContacts: ChatContact[] = [];
        const allMsgs: (ChatMessage & { contact_name?: string })[] = [];
        for (const t of threads) {
          allContacts.push(t);
          if (t.messages) {
            for (const m of t.messages) {
              allMsgs.push({ ...m, contact_name: t.name });
            }
          }
        }
        setContacts(allContacts);
        setMessages(allMsgs);
      }
    } catch {
      // ignore
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFlash(null);

    const formData = new FormData();
    formData.append('action', 'save_contact');
    formData.append('id', String(editingContact?.id || 0));
    formData.append('name', cName);
    formData.append('phone', cPhone);
    formData.append('status_text', cStatus);
    formData.append('last_seen', cLastSeen);
    formData.append('avatar_color', cAvatarColor);
    formData.append('sort_order', String(cSort));
    formData.append('is_active', cActive ? '1' : '0');
    if (cAvatarFile) {
      formData.append('avatar', cAvatarFile);
    }

    try {
      const res = await fetch('/api/admin/chats', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFlash({ type: 'ok', message: data.message || 'Contact saved.' });
        resetContactForm();
        await refreshData();
      } else {
        setFlash({ type: 'err', message: data.error || 'Failed to save contact.' });
      }
    } catch (err: unknown) {
      setFlash({ type: 'err', message: err instanceof Error ? err.message : 'Error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (id: number) => {
    if (!window.confirm('Delete contact and all messages?')) return;
    setLoading(true);
    setFlash(null);

    const formData = new FormData();
    formData.append('action', 'delete_contact');
    formData.append('id', String(id));

    try {
      const res = await fetch('/api/admin/chats', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.success) {
        setFlash({ type: 'ok', message: 'Contact purged.' });
        if (editingContact?.id === id) resetContactForm();
        await refreshData();
      } else {
        setFlash({ type: 'err', message: data.error || 'Failed to delete contact.' });
      }
    } catch (err: unknown) {
      setFlash({ type: 'err', message: err instanceof Error ? err.message : 'Error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFlash(null);

    const formData = new FormData();
    formData.append('action', 'save_message');
    formData.append('id', String(editingMessage?.id || 0));
    formData.append('contact_id', String(mContactId));
    formData.append('sender', mSender);
    formData.append('message', mMessage);
    formData.append('sent_at', mSentAt);
    formData.append('sort_order', String(mSort));

    try {
      const res = await fetch('/api/admin/chats', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.success) {
        setFlash({ type: 'ok', message: data.message || 'Message saved.' });
        resetMessageForm();
        await refreshData();
      } else {
        setFlash({ type: 'err', message: data.error || 'Failed to save message.' });
      }
    } catch (err: unknown) {
      setFlash({ type: 'err', message: err instanceof Error ? err.message : 'Error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm('Delete message?')) return;
    setLoading(true);
    setFlash(null);

    const formData = new FormData();
    formData.append('action', 'delete_message');
    formData.append('id', String(id));

    try {
      const res = await fetch('/api/admin/chats', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.success) {
        setFlash({ type: 'ok', message: 'Message removed.' });
        if (editingMessage?.id === id) resetMessageForm();
        await refreshData();
      } else {
        setFlash({ type: 'err', message: data.error || 'Failed to delete message.' });
      }
    } catch (err: unknown) {
      setFlash({ type: 'err', message: err instanceof Error ? err.message : 'Error.' });
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = filterContactId
    ? messages.filter((m) => m.contact_id === filterContactId)
    : messages;

  return (
    <div>
      {flash && (
        <div className={`flash ${flash.type === 'ok' ? 'ok' : 'err'}`}>
          {flash.message}
        </div>
      )}

      <div className="actions" style={{ marginBottom: '1.25rem' }}>
        <button
          className={`btn ${tab === 'contacts' ? '' : 'btn-ghost'}`}
          type="button"
          onClick={() => {
            setTab('contacts');
            setFlash(null);
          }}
        >
          {`CONTACTS (${contacts.length})`}
        </button>
        <button
          className={`btn ${tab === 'messages' ? '' : 'btn-ghost'}`}
          type="button"
          onClick={() => {
            setTab('messages');
            setFlash(null);
          }}
        >
          {`MESSAGES (${messages.length})`}
        </button>
      </div>

      {tab === 'contacts' ? (
        <>
          <div className="form-panel">
            <h2>{editingContact ? `EDIT CONTACT #${editingContact.id}` : 'ADD NEW CONTACT'}</h2>
            <form onSubmit={handleContactSubmit}>
              <div className="grid-2">
                <div>
                  <label>Name</label>
                  <input
                    type="text"
                    required
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                  />
                </div>
                <div>
                  <label>Phone</label>
                  <input
                    type="text"
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label>Status / About</label>
                  <input
                    type="text"
                    value={cStatus}
                    onChange={(e) => setCStatus(e.target.value)}
                  />
                </div>
                <div>
                  <label>Last Seen Text</label>
                  <input
                    type="text"
                    value={cLastSeen}
                    onChange={(e) => setCLastSeen(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label>Avatar Color</label>
                  <input
                    type="text"
                    value={cAvatarColor}
                    onChange={(e) => setCAvatarColor(e.target.value)}
                  />
                </div>
                <div>
                  <label>Sort Order</label>
                  <input
                    type="number"
                    value={cSort}
                    onChange={(e) => setCSort(Number(e.target.value))}
                  />
                </div>
              </div>

              <label>Avatar Image {editingContact ? '(optional replace)' : '(optional)'}</label>
              <input
                id="contact-avatar-input"
                type="file"
                accept="image/*"
                onChange={(e) => setCAvatarFile(e.target.files?.[0] || null)}
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={cActive}
                  onChange={(e) => setCActive(e.target.checked)}
                />
                Visible on front site
              </label>

              <div className="actions">
                <button className="btn" type="submit" disabled={loading}>
                  {loading
                    ? 'SAVING...'
                    : editingContact
                    ? 'UPDATE CONTACT →'
                    : 'ADD CONTACT →'}
                </button>
                {editingContact && (
                  <button className="btn btn-ghost" type="button" onClick={resetContactForm}>
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
                  <th>Avatar</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Last Seen</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No contacts found.</td>
                  </tr>
                ) : (
                  contacts.map((c) => (
                    <tr key={c.id}>
                      <td>
                        {c.avatar_path ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={c.avatar_path.startsWith('/') ? c.avatar_path : `/${c.avatar_path}`}
                            alt=""
                            style={{
                              borderRadius: '50%',
                              width: '40px',
                              height: '40px',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <span
                            className="badge on"
                            style={{
                              background: c.avatar_color || '#25d366',
                              color: '#04120c',
                              border: 'none',
                              borderRadius: '50%',
                              width: '36px',
                              height: '36px',
                              display: 'inline-grid',
                              placeItems: 'center',
                              fontWeight: 700,
                            }}
                          >
                            {getInitials(c.name)}
                          </span>
                        )}
                      </td>
                      <td>{c.name}</td>
                      <td>{c.phone}</td>
                      <td>{c.last_seen}</td>
                      <td>
                        <span className={`badge ${c.is_active ? 'on' : 'off'}`}>
                          {c.is_active ? 'LIVE' : 'HIDDEN'}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={() => handleEditContact(c)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={() => {
                            setTab('messages');
                            setFilterContactId(c.id);
                            setMContactId(c.id);
                          }}
                        >
                          Chats
                        </button>
                        <button
                          className="btn btn-danger"
                          type="button"
                          onClick={() => handleDeleteContact(c.id)}
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
        </>
      ) : (
        <>
          <div className="form-panel">
            <h2>{editingMessage ? `EDIT MESSAGE #${editingMessage.id}` : 'ADD MESSAGE'}</h2>
            <form onSubmit={handleMessageSubmit}>
              <div className="grid-2">
                <div>
                  <label>Contact</label>
                  <select
                    required
                    value={mContactId}
                    onChange={(e) => setMContactId(Number(e.target.value))}
                  >
                    <option value="">Select contact…</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Sender</label>
                  <select
                    value={mSender}
                    onChange={(e) => setMSender(e.target.value as 'them' | 'me')}
                  >
                    <option value="them">Them (incoming left)</option>
                    <option value="me">Me (outgoing right)</option>
                  </select>
                </div>
              </div>

              <label>Message</label>
              <textarea
                required
                value={mMessage}
                onChange={(e) => setMMessage(e.target.value)}
              />

              <div className="grid-2">
                <div>
                  <label>Sent At</label>
                  <input
                    type="datetime-local"
                    value={mSentAt}
                    onChange={(e) => setMSentAt(e.target.value)}
                  />
                </div>
                <div>
                  <label>Sort Order</label>
                  <input
                    type="number"
                    value={mSort}
                    onChange={(e) => setMSort(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="actions">
                <button className="btn" type="submit" disabled={loading}>
                  {loading
                    ? 'SAVING...'
                    : editingMessage
                    ? 'UPDATE MESSAGE →'
                    : 'ADD MESSAGE →'}
                </button>
                {editingMessage && (
                  <button className="btn btn-ghost" type="button" onClick={resetMessageForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="actions" style={{ marginBottom: '1rem' }}>
            <button
              className={`btn ${filterContactId === null ? '' : 'btn-ghost'}`}
              type="button"
              onClick={() => setFilterContactId(null)}
            >
              All
            </button>
            {contacts.map((c) => (
              <button
                key={c.id}
                className={`btn ${filterContactId === c.id ? '' : 'btn-ghost'}`}
                type="button"
                onClick={() => setFilterContactId(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Sender</th>
                  <th>Message</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No messages yet. Add one above.</td>
                  </tr>
                ) : (
                  filteredMessages.map((m) => (
                    <tr key={m.id}>
                      <td>{m.contact_name || `Contact #${m.contact_id}`}</td>
                      <td>{m.sender === 'me' ? 'ME →' : '← THEM'}</td>
                      <td>
                        {m.message.length > 80 ? m.message.substring(0, 80) + '…' : m.message}
                      </td>
                      <td>
                        {new Date(m.sent_at).toISOString().replace('T', ' ').substring(0, 16)}
                      </td>
                      <td className="actions">
                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={() => handleEditMessage(m)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          type="button"
                          onClick={() => handleDeleteMessage(m.id)}
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
        </>
      )}
    </div>
  );
}
