import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getDbPool, getMongoDb } from './db';
import { getNextNumericId } from './mongodb';
import {
  DEFAULT_CONTENT_ROWS,
  DEFAULT_CONTENT_DICT,
  DEFAULT_GALLERY_ITEMS,
  DEFAULT_INTEL_FEEDS,
  DEFAULT_CHAT_CONTACTS,
  DEFAULT_CHAT_MESSAGES,
  DEFAULT_ADMIN,
} from './defaults';
import { SiteContent, GalleryItem, IntelFeed, ChatContact, ChatMessage, Admin } from '@/types/database';
import { GroupedContent } from '@/types/content';
import { GalleryInput } from '@/types/gallery';
import { FeedInput } from '@/types/feed';
import { ContactInput, MessageInput, ChatThread } from '@/types/chat';

// Local mutable fallbacks for offline / mock testing
const memContent = [...DEFAULT_CONTENT_ROWS];
const memGallery = [...DEFAULT_GALLERY_ITEMS];
const memFeeds = [...DEFAULT_INTEL_FEEDS];
const memContacts = [...DEFAULT_CHAT_CONTACTS];
const memMessages = [...DEFAULT_CHAT_MESSAGES];

// =================== SITE CONTENT ===================

export async function getSiteContent(): Promise<Record<string, string>> {
  const mongo = await getMongoDb();
  if (mongo) {
    try {
      const rows = await mongo.collection<SiteContent>('site_content').find().toArray();
      if (rows && rows.length > 0) {
        const dict: Record<string, string> = {};
        for (const r of rows) {
          dict[r.content_key] = String(r.content_value ?? '');
        }
        return dict;
      }
    } catch (err) {
      console.warn('[Queries] Could not query site_content from MongoDB:', err);
    }
  }

  const pool = getDbPool();
  if (pool) {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT content_key, content_value FROM site_content'
      );
      if (rows && rows.length > 0) {
        const dict: Record<string, string> = {};
        for (const r of rows) {
          dict[r.content_key] = String(r.content_value ?? '');
        }
        return dict;
      }
    } catch (err) {
      console.warn('[Queries] Could not query site_content from MySQL, using fallback:', err);
    }
  }

  const dict: Record<string, string> = { ...DEFAULT_CONTENT_DICT };
  for (const item of memContent) {
    dict[item.content_key] = item.content_value;
  }
  return dict;
}

export async function getContentByKey(key: string, defaultValue = ''): Promise<string> {
  const all = await getSiteContent();
  return all[key] !== undefined ? all[key] : defaultValue;
}

export async function getAllSiteContent(): Promise<SiteContent[]> {
  const mongo = await getMongoDb();
  if (mongo) {
    try {
      const rows = await mongo
        .collection<SiteContent>('site_content')
        .find()
        .sort({ section: 1, id: 1 })
        .toArray();
      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          content_key: r.content_key,
          content_value: r.content_value,
          label: r.label,
          section: r.section,
          updated_at: r.updated_at,
        }));
      }
    } catch (err) {
      console.warn('[Queries] Could not query all site_content from MongoDB:', err);
    }
  }

  const pool = getDbPool();
  if (pool) {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM site_content ORDER BY section, id'
      );
      if (rows && rows.length > 0) {
        return rows as unknown as SiteContent[];
      }
    } catch (err) {
      console.warn('[Queries] Could not query all site_content from MySQL:', err);
    }
  }
  return memContent;
}

export async function getContentBySection(): Promise<GroupedContent> {
  const all = await getAllSiteContent();
  const grouped: GroupedContent = {};
  for (const row of all) {
    if (!grouped[row.section]) {
      grouped[row.section] = [];
    }
    grouped[row.section].push(row);
  }
  return grouped;
}

export async function updateSiteContent(key: string, value: string): Promise<boolean> {
  const mongo = await getMongoDb();
  if (mongo) {
    try {
      await mongo.collection('site_content').updateOne(
        { content_key: key },
        { $set: { content_value: value, updated_at: new Date() } },
        { upsert: true }
      );
      return true;
    } catch (err) {
      console.error('[Queries] MongoDB error updating site content:', err);
      throw err;
    }
  }

  const pool = getDbPool();
  if (pool) {
    try {
      await pool.execute(
        'UPDATE site_content SET content_value = ? WHERE content_key = ?',
        [value, key]
      );
      return true;
    } catch (err) {
      console.error('[Queries] MySQL error updating site content:', err);
      throw err;
    }
  }

  const found = memContent.find((c) => c.content_key === key);
  if (found) {
    found.content_value = value;
  } else {
    memContent.push({
      id: memContent.length + 1,
      content_key: key,
      content_value: value,
      label: key,
      section: 'general',
    });
  }
  return true;
}

export async function updateMultipleSiteContent(records: Record<string, string>): Promise<boolean> {
  const mongo = await getMongoDb();
  if (mongo) {
    try {
      const operations = Object.entries(records).map(([key, value]) => ({
        updateOne: {
          filter: { content_key: key },
          update: { $set: { content_value: value, updated_at: new Date() } },
          upsert: true,
        },
      }));
      if (operations.length > 0) {
        await mongo.collection('site_content').bulkWrite(operations);
      }
      return true;
    } catch (err) {
      console.error('[Queries] MongoDB error bulk updating site content:', err);
      throw err;
    }
  }

  const pool = getDbPool();
  if (pool) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const [key, value] of Object.entries(records)) {
        await conn.execute(
          'UPDATE site_content SET content_value = ? WHERE content_key = ?',
          [value, key]
        );
      }
      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  for (const [key, value] of Object.entries(records)) {
    const found = memContent.find((c) => c.content_key === key);
    if (found) {
      found.content_value = value;
    }
  }
  return true;
}

// =================== GALLERY ===================

export async function getGalleryItems(activeOnly = true): Promise<GalleryItem[]> {
  const mongo = await getMongoDb();
  if (mongo) {
    try {
      const filter = activeOnly ? { is_active: { $in: [1, true] } } : {};
      const rows = await mongo
        .collection<GalleryItem>('gallery')
        .find(filter)
        .sort({ sort_order: 1, id: -1 })
        .toArray();
      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description ?? null,
        image_path: r.image_path,
        category: r.category,
        sort_order: r.sort_order,
        is_active: r.is_active ? 1 : 0,
        created_at: r.created_at,
      }));
    } catch (err) {
      console.warn('[Queries] Could not query gallery from MongoDB:', err);
    }
  }

  const pool = getDbPool();
  if (pool) {
    try {
      let sql = 'SELECT * FROM gallery';
      if (activeOnly) {
        sql += ' WHERE is_active = 1';
      }
      sql += ' ORDER BY sort_order ASC, id DESC';
      const [rows] = await pool.query<RowDataPacket[]>(sql);
      return rows as unknown as GalleryItem[];
    } catch (err) {
      console.warn('[Queries] Could not query gallery from MySQL:', err);
    }
  }

  return memGallery
    .filter((g) => (!activeOnly ? true : Boolean(g.is_active)))
    .sort((a, b) => a.sort_order - b.sort_order || b.id - a.id);
}

export async function getActiveGalleryItems(): Promise<GalleryItem[]> {
  return getGalleryItems(true);
}

export async function getGalleryItemById(id: number): Promise<GalleryItem | null> {
  const mongo = await getMongoDb();
  if (mongo) {
    const row = await mongo.collection<GalleryItem>('gallery').findOne({ id: Number(id) });
    if (row) {
      return {
        id: row.id,
        title: row.title,
        description: row.description ?? null,
        image_path: row.image_path,
        category: row.category,
        sort_order: row.sort_order,
        is_active: row.is_active ? 1 : 0,
        created_at: row.created_at,
      };
    }
    return null;
  }

  const pool = getDbPool();
  if (pool) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM gallery WHERE id = ? LIMIT 1',
      [id]
    );
    return (rows[0] as unknown as GalleryItem) || null;
  }
  return memGallery.find((g) => g.id === id) || null;
}

export async function createGalleryItem(data: GalleryInput): Promise<number> {
  const mongo = await getMongoDb();
  if (mongo) {
    const newId = await getNextNumericId(mongo, 'gallery');
    await mongo.collection('gallery').insertOne({
      id: newId,
      title: data.title,
      description: data.description || '',
      image_path: data.image_path || '',
      category: data.category || 'ops',
      sort_order: data.sort_order || 0,
      is_active: data.is_active ? 1 : 0,
      created_at: new Date().toISOString(),
    });
    return newId;
  }

  const pool = getDbPool();
  if (pool) {
    const [res] = await pool.execute<ResultSetHeader>(
      'INSERT INTO gallery (title, description, image_path, category, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [
        data.title,
        data.description || '',
        data.image_path || '',
        data.category || 'ops',
        data.sort_order || 0,
        data.is_active ? 1 : 0,
      ]
    );
    return res.insertId;
  }

  const newId = memGallery.length ? Math.max(...memGallery.map((g) => g.id)) + 1 : 1;
  memGallery.push({
    id: newId,
    title: data.title,
    description: data.description || null,
    image_path: data.image_path || '/assets/uploads/placeholder-soc.svg',
    category: data.category || 'ops',
    sort_order: data.sort_order || 0,
    is_active: data.is_active ? 1 : 0,
    created_at: new Date().toISOString(),
  });
  return newId;
}

export async function updateGalleryItem(
  id: number,
  data: Partial<GalleryInput>
): Promise<boolean> {
  const mongo = await getMongoDb();
  if (mongo) {
    const updateDoc: Record<string, unknown> = {};
    if (data.title !== undefined) updateDoc.title = data.title;
    if (data.description !== undefined) updateDoc.description = data.description;
    if (data.category !== undefined) updateDoc.category = data.category;
    if (data.sort_order !== undefined) updateDoc.sort_order = data.sort_order;
    if (data.is_active !== undefined) updateDoc.is_active = data.is_active ? 1 : 0;
    if (data.image_path !== undefined) updateDoc.image_path = data.image_path;

    if (Object.keys(updateDoc).length > 0) {
      await mongo.collection('gallery').updateOne({ id: Number(id) }, { $set: updateDoc });
    }
    return true;
  }

  const pool = getDbPool();
  if (pool) {
    const fields: string[] = [];
    const values: (string | number)[] = [];
    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.category !== undefined) {
      fields.push('category = ?');
      values.push(data.category);
    }
    if (data.sort_order !== undefined) {
      fields.push('sort_order = ?');
      values.push(data.sort_order);
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(data.is_active ? 1 : 0);
    }
    if (data.image_path !== undefined) {
      fields.push('image_path = ?');
      values.push(data.image_path);
    }

    if (fields.length === 0) return true;
    values.push(id);

    await pool.execute(
      `UPDATE gallery SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  }

  const item = memGallery.find((g) => g.id === id);
  if (item) {
    if (data.title !== undefined) item.title = data.title;
    if (data.description !== undefined) item.description = data.description;
    if (data.category !== undefined) item.category = data.category;
    if (data.sort_order !== undefined) item.sort_order = data.sort_order;
    if (data.is_active !== undefined) item.is_active = data.is_active ? 1 : 0;
    if (data.image_path !== undefined) item.image_path = data.image_path;
  }
  return true;
}

export async function deleteGalleryItem(id: number): Promise<boolean> {
  const mongo = await getMongoDb();
  if (mongo) {
    await mongo.collection('gallery').deleteOne({ id: Number(id) });
    return true;
  }

  const pool = getDbPool();
  if (pool) {
    await pool.execute('DELETE FROM gallery WHERE id = ?', [id]);
    return true;
  }
  const idx = memGallery.findIndex((g) => g.id === id);
  if (idx !== -1) {
    memGallery.splice(idx, 1);
  }
  return true;
}

// =================== INTEL FEEDS ===================

export async function getIntelFeeds(activeOnly = true): Promise<IntelFeed[]> {
  const mongo = await getMongoDb();
  if (mongo) {
    try {
      const filter = activeOnly ? { is_active: { $in: [1, true] } } : {};
      const rows = await mongo
        .collection<IntelFeed>('intel_feeds')
        .find(filter)
        .sort({ created_at: -1, id: -1 })
        .toArray();
      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        body: r.body,
        threat_level: r.threat_level,
        is_active: r.is_active ? 1 : 0,
        created_at: r.created_at,
      }));
    } catch (err) {
      console.warn('[Queries] Could not query intel_feeds from MongoDB:', err);
    }
  }

  const pool = getDbPool();
  if (pool) {
    try {
      let sql = 'SELECT * FROM intel_feeds';
      if (activeOnly) {
        sql += ' WHERE is_active = 1';
      }
      sql += ' ORDER BY created_at DESC';
      const [rows] = await pool.query<RowDataPacket[]>(sql);
      return rows as unknown as IntelFeed[];
    } catch (err) {
      console.warn('[Queries] Could not query intel_feeds from MySQL:', err);
    }
  }

  return memFeeds
    .filter((f) => (!activeOnly ? true : Boolean(f.is_active)))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getActiveIntelFeeds(): Promise<IntelFeed[]> {
  return getIntelFeeds(true);
}

export async function getIntelFeedById(id: number): Promise<IntelFeed | null> {
  const mongo = await getMongoDb();
  if (mongo) {
    const row = await mongo.collection<IntelFeed>('intel_feeds').findOne({ id: Number(id) });
    if (row) {
      return {
        id: row.id,
        title: row.title,
        body: row.body,
        threat_level: row.threat_level,
        is_active: row.is_active ? 1 : 0,
        created_at: row.created_at,
      };
    }
    return null;
  }

  const pool = getDbPool();
  if (pool) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM intel_feeds WHERE id = ? LIMIT 1',
      [id]
    );
    return (rows[0] as unknown as IntelFeed) || null;
  }
  return memFeeds.find((f) => f.id === id) || null;
}

export async function createIntelFeed(data: FeedInput): Promise<number> {
  const mongo = await getMongoDb();
  if (mongo) {
    const newId = await getNextNumericId(mongo, 'intel_feeds');
    await mongo.collection('intel_feeds').insertOne({
      id: newId,
      title: data.title,
      body: data.body,
      threat_level: data.threat_level || 'medium',
      is_active: data.is_active ? 1 : 0,
      created_at: new Date().toISOString(),
    });
    return newId;
  }

  const pool = getDbPool();
  if (pool) {
    const [res] = await pool.execute<ResultSetHeader>(
      'INSERT INTO intel_feeds (title, body, threat_level, is_active) VALUES (?, ?, ?, ?)',
      [data.title, data.body, data.threat_level || 'medium', data.is_active ? 1 : 0]
    );
    return res.insertId;
  }

  const newId = memFeeds.length ? Math.max(...memFeeds.map((f) => f.id)) + 1 : 1;
  memFeeds.unshift({
    id: newId,
    title: data.title,
    body: data.body,
    threat_level: data.threat_level,
    is_active: data.is_active ? 1 : 0,
    created_at: new Date().toISOString(),
  });
  return newId;
}

export async function updateIntelFeed(
  id: number,
  data: Partial<FeedInput>
): Promise<boolean> {
  const mongo = await getMongoDb();
  if (mongo) {
    const updateDoc: Record<string, unknown> = {};
    if (data.title !== undefined) updateDoc.title = data.title;
    if (data.body !== undefined) updateDoc.body = data.body;
    if (data.threat_level !== undefined) updateDoc.threat_level = data.threat_level;
    if (data.is_active !== undefined) updateDoc.is_active = data.is_active ? 1 : 0;

    if (Object.keys(updateDoc).length > 0) {
      await mongo.collection('intel_feeds').updateOne({ id: Number(id) }, { $set: updateDoc });
    }
    return true;
  }

  const pool = getDbPool();
  if (pool) {
    const fields: string[] = [];
    const values: (string | number)[] = [];
    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.body !== undefined) {
      fields.push('body = ?');
      values.push(data.body);
    }
    if (data.threat_level !== undefined) {
      fields.push('threat_level = ?');
      values.push(data.threat_level);
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(data.is_active ? 1 : 0);
    }

    if (fields.length === 0) return true;
    values.push(id);

    await pool.execute(
      `UPDATE intel_feeds SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  }

  const item = memFeeds.find((f) => f.id === id);
  if (item) {
    if (data.title !== undefined) item.title = data.title;
    if (data.body !== undefined) item.body = data.body;
    if (data.threat_level !== undefined) item.threat_level = data.threat_level;
    if (data.is_active !== undefined) item.is_active = data.is_active ? 1 : 0;
  }
  return true;
}

export async function deleteIntelFeed(id: number): Promise<boolean> {
  const mongo = await getMongoDb();
  if (mongo) {
    await mongo.collection('intel_feeds').deleteOne({ id: Number(id) });
    return true;
  }

  const pool = getDbPool();
  if (pool) {
    await pool.execute('DELETE FROM intel_feeds WHERE id = ?', [id]);
    return true;
  }
  const idx = memFeeds.findIndex((f) => f.id === id);
  if (idx !== -1) {
    memFeeds.splice(idx, 1);
  }
  return true;
}

// =================== CHATS ===================

export async function getChatContacts(activeOnly = true): Promise<ChatContact[]> {
  const mongo = await getMongoDb();
  if (mongo) {
    try {
      const filter = activeOnly ? { is_active: { $in: [1, true] } } : {};
      const rows = await mongo
        .collection<ChatContact>('chat_contacts')
        .find(filter)
        .sort({ sort_order: 1, id: 1 })
        .toArray();
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        status_text: r.status_text,
        avatar_path: r.avatar_path,
        avatar_color: r.avatar_color,
        last_seen: r.last_seen,
        is_active: r.is_active ? 1 : 0,
        sort_order: r.sort_order,
        created_at: r.created_at,
      }));
    } catch (err) {
      console.warn('[Queries] Could not query chat_contacts from MongoDB:', err);
    }
  }

  const pool = getDbPool();
  if (pool) {
    try {
      let sql = 'SELECT * FROM chat_contacts';
      if (activeOnly) {
        sql += ' WHERE is_active = 1';
      }
      sql += ' ORDER BY sort_order ASC, id ASC';
      const [rows] = await pool.query<RowDataPacket[]>(sql);
      return rows as unknown as ChatContact[];
    } catch (err) {
      console.warn('[Queries] Could not query chat_contacts from MySQL:', err);
    }
  }

  return memContacts
    .filter((c) => (!activeOnly ? true : Boolean(c.is_active)))
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
}

export async function getChatMessages(contactId?: number): Promise<(ChatMessage & { contact_name?: string })[]> {
  const mongo = await getMongoDb();
  if (mongo) {
    try {
      if (contactId) {
        const rows = await mongo
          .collection<ChatMessage>('chat_messages')
          .find({ contact_id: Number(contactId) })
          .sort({ sent_at: 1, sort_order: 1, id: 1 })
          .toArray();
        return rows.map((r) => ({
          id: r.id,
          contact_id: r.contact_id,
          sender: r.sender,
          message: r.message,
          sent_at: r.sent_at,
          is_read: r.is_read ? 1 : 0,
          sort_order: r.sort_order,
        }));
      }

      const contacts = await mongo.collection<ChatContact>('chat_contacts').find().toArray();
      const contactMap = new Map(contacts.map((c) => [c.id, c.name]));

      const rows = await mongo
        .collection<ChatMessage>('chat_messages')
        .find()
        .sort({ sent_at: -1, id: -1 })
        .toArray();

      return rows.map((r) => ({
        id: r.id,
        contact_id: r.contact_id,
        sender: r.sender,
        message: r.message,
        sent_at: r.sent_at,
        is_read: r.is_read ? 1 : 0,
        sort_order: r.sort_order,
        contact_name: contactMap.get(r.contact_id) || 'Unknown',
      }));
    } catch (err) {
      console.warn('[Queries] Could not query chat_messages from MongoDB:', err);
    }
  }

  const pool = getDbPool();
  if (pool) {
    try {
      if (contactId) {
        const [rows] = await pool.execute<RowDataPacket[]>(
          'SELECT * FROM chat_messages WHERE contact_id = ? ORDER BY sent_at ASC, sort_order ASC, id ASC',
          [contactId]
        );
        return rows as unknown as ChatMessage[];
      }
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT m.*, c.name as contact_name
         FROM chat_messages m
         LEFT JOIN chat_contacts c ON c.id = m.contact_id
         ORDER BY m.sent_at DESC, m.id DESC`
      );
      return rows as unknown as (ChatMessage & { contact_name?: string })[];
    } catch (err) {
      console.warn('[Queries] Could not query chat_messages from MySQL:', err);
    }
  }

  if (contactId) {
    return memMessages
      .filter((m) => m.contact_id === contactId)
      .sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
  }

  return memMessages.map((m) => {
    const contact = memContacts.find((c) => c.id === m.contact_id);
    return {
      ...m,
      contact_name: contact ? contact.name : 'Unknown',
    };
  });
}

export async function getChatThreads(activeOnly = true): Promise<ChatThread[]> {
  const contacts = await getChatContacts(activeOnly);
  const threads: ChatThread[] = [];

  for (const contact of contacts) {
    const messages = await getChatMessages(contact.id);
    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : undefined;
    threads.push({
      ...contact,
      messages,
      preview: lastMsg ? lastMsg.message : '',
      preview_time: lastMsg ? String(lastMsg.sent_at) : null,
    });
  }

  return threads;
}

export async function createChatContact(data: ContactInput): Promise<number> {
  const mongo = await getMongoDb();
  if (mongo) {
    const newId = await getNextNumericId(mongo, 'chat_contacts');
    await mongo.collection('chat_contacts').insertOne({
      id: newId,
      name: data.name,
      phone: data.phone || '',
      status_text: data.status_text || 'online',
      avatar_path: data.avatar_path || null,
      avatar_color: data.avatar_color || '#00a884',
      last_seen: data.last_seen || 'online',
      is_active: data.is_active ? 1 : 0,
      sort_order: data.sort_order || 0,
      created_at: new Date().toISOString(),
    });
    return newId;
  }

  const pool = getDbPool();
  if (pool) {
    const [res] = await pool.execute<ResultSetHeader>(
      `INSERT INTO chat_contacts (name, phone, status_text, avatar_path, avatar_color, last_seen, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.phone || '',
        data.status_text || 'online',
        data.avatar_path || null,
        data.avatar_color || '#00a884',
        data.last_seen || 'online',
        data.is_active ? 1 : 0,
        data.sort_order || 0,
      ]
    );
    return res.insertId;
  }

  const newId = memContacts.length ? Math.max(...memContacts.map((c) => c.id)) + 1 : 1;
  memContacts.push({
    id: newId,
    name: data.name,
    phone: data.phone || '',
    status_text: data.status_text || 'online',
    avatar_path: data.avatar_path || null,
    avatar_color: data.avatar_color || '#00a884',
    last_seen: data.last_seen || 'online',
    is_active: data.is_active ? 1 : 0,
    sort_order: data.sort_order || 0,
  });
  return newId;
}

export async function updateChatContact(
  id: number,
  data: Partial<ContactInput>
): Promise<boolean> {
  const mongo = await getMongoDb();
  if (mongo) {
    const updateDoc: Record<string, unknown> = {};
    if (data.name !== undefined) updateDoc.name = data.name;
    if (data.phone !== undefined) updateDoc.phone = data.phone;
    if (data.status_text !== undefined) updateDoc.status_text = data.status_text;
    if (data.avatar_path !== undefined) updateDoc.avatar_path = data.avatar_path;
    if (data.avatar_color !== undefined) updateDoc.avatar_color = data.avatar_color;
    if (data.last_seen !== undefined) updateDoc.last_seen = data.last_seen;
    if (data.sort_order !== undefined) updateDoc.sort_order = data.sort_order;
    if (data.is_active !== undefined) updateDoc.is_active = data.is_active ? 1 : 0;

    if (Object.keys(updateDoc).length > 0) {
      await mongo.collection('chat_contacts').updateOne({ id: Number(id) }, { $set: updateDoc });
    }
    return true;
  }

  const pool = getDbPool();
  if (pool) {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.phone !== undefined) {
      fields.push('phone = ?');
      values.push(data.phone);
    }
    if (data.status_text !== undefined) {
      fields.push('status_text = ?');
      values.push(data.status_text);
    }
    if (data.avatar_path !== undefined) {
      fields.push('avatar_path = ?');
      values.push(data.avatar_path);
    }
    if (data.avatar_color !== undefined) {
      fields.push('avatar_color = ?');
      values.push(data.avatar_color);
    }
    if (data.last_seen !== undefined) {
      fields.push('last_seen = ?');
      values.push(data.last_seen);
    }
    if (data.sort_order !== undefined) {
      fields.push('sort_order = ?');
      values.push(data.sort_order);
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(data.is_active ? 1 : 0);
    }

    if (fields.length === 0) return true;
    values.push(id);

    await pool.execute(
      `UPDATE chat_contacts SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  }

  const contact = memContacts.find((c) => c.id === id);
  if (contact) {
    if (data.name !== undefined) contact.name = data.name;
    if (data.phone !== undefined) contact.phone = data.phone;
    if (data.status_text !== undefined) contact.status_text = data.status_text;
    if (data.avatar_path !== undefined) contact.avatar_path = data.avatar_path;
    if (data.avatar_color !== undefined) contact.avatar_color = data.avatar_color;
    if (data.last_seen !== undefined) contact.last_seen = data.last_seen;
    if (data.sort_order !== undefined) contact.sort_order = data.sort_order;
    if (data.is_active !== undefined) contact.is_active = data.is_active ? 1 : 0;
  }
  return true;
}

export async function deleteChatContact(id: number): Promise<boolean> {
  const mongo = await getMongoDb();
  if (mongo) {
    await mongo.collection('chat_contacts').deleteOne({ id: Number(id) });
    await mongo.collection('chat_messages').deleteMany({ contact_id: Number(id) });
    return true;
  }

  const pool = getDbPool();
  if (pool) {
    await pool.execute('DELETE FROM chat_contacts WHERE id = ?', [id]);
    return true;
  }
  const idx = memContacts.findIndex((c) => c.id === id);
  if (idx !== -1) {
    memContacts.splice(idx, 1);
  }
  // cascade delete messages
  for (let i = memMessages.length - 1; i >= 0; i--) {
    if (memMessages[i].contact_id === id) {
      memMessages.splice(i, 1);
    }
  }
  return true;
}

export async function createChatMessage(data: MessageInput): Promise<number> {
  const mongo = await getMongoDb();
  const sentAt = data.sent_at || new Date().toISOString();
  if (mongo) {
    const newId = await getNextNumericId(mongo, 'chat_messages');
    await mongo.collection('chat_messages').insertOne({
      id: newId,
      contact_id: Number(data.contact_id),
      sender: data.sender,
      message: data.message,
      sent_at: sentAt,
      sort_order: data.sort_order || 0,
      is_read: 1,
    });
    return newId;
  }

  const pool = getDbPool();
  if (pool) {
    const [res] = await pool.execute<ResultSetHeader>(
      `INSERT INTO chat_messages (contact_id, sender, message, sent_at, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      [data.contact_id, data.sender, data.message, sentAt, data.sort_order || 0]
    );
    return res.insertId;
  }

  const newId = memMessages.length ? Math.max(...memMessages.map((m) => m.id)) + 1 : 1;
  memMessages.push({
    id: newId,
    contact_id: data.contact_id,
    sender: data.sender,
    message: data.message,
    sent_at: sentAt,
    sort_order: data.sort_order || 0,
    is_read: 1,
  });
  return newId;
}

export async function updateChatMessage(
  id: number,
  data: Partial<MessageInput>
): Promise<boolean> {
  const mongo = await getMongoDb();
  if (mongo) {
    const updateDoc: Record<string, unknown> = {};
    if (data.contact_id !== undefined) updateDoc.contact_id = Number(data.contact_id);
    if (data.sender !== undefined) updateDoc.sender = data.sender;
    if (data.message !== undefined) updateDoc.message = data.message;
    if (data.sent_at !== undefined) updateDoc.sent_at = data.sent_at;
    if (data.sort_order !== undefined) updateDoc.sort_order = data.sort_order;

    if (Object.keys(updateDoc).length > 0) {
      await mongo.collection('chat_messages').updateOne({ id: Number(id) }, { $set: updateDoc });
    }
    return true;
  }

  const pool = getDbPool();
  if (pool) {
    const fields: string[] = [];
    const values: (string | number)[] = [];
    if (data.contact_id !== undefined) {
      fields.push('contact_id = ?');
      values.push(data.contact_id);
    }
    if (data.sender !== undefined) {
      fields.push('sender = ?');
      values.push(data.sender);
    }
    if (data.message !== undefined) {
      fields.push('message = ?');
      values.push(data.message);
    }
    if (data.sent_at !== undefined) {
      fields.push('sent_at = ?');
      values.push(data.sent_at);
    }
    if (data.sort_order !== undefined) {
      fields.push('sort_order = ?');
      values.push(data.sort_order);
    }

    if (fields.length === 0) return true;
    values.push(id);

    await pool.execute(
      `UPDATE chat_messages SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  }

  const msg = memMessages.find((m) => m.id === id);
  if (msg) {
    if (data.contact_id !== undefined) msg.contact_id = data.contact_id;
    if (data.sender !== undefined) msg.sender = data.sender;
    if (data.message !== undefined) msg.message = data.message;
    if (data.sent_at !== undefined) msg.sent_at = data.sent_at;
    if (data.sort_order !== undefined) msg.sort_order = data.sort_order;
  }
  return true;
}

export async function deleteChatMessage(id: number): Promise<boolean> {
  const mongo = await getMongoDb();
  if (mongo) {
    await mongo.collection('chat_messages').deleteOne({ id: Number(id) });
    return true;
  }

  const pool = getDbPool();
  if (pool) {
    await pool.execute('DELETE FROM chat_messages WHERE id = ?', [id]);
    return true;
  }
  const idx = memMessages.findIndex((c) => c.id === id);
  if (idx !== -1) {
    memMessages.splice(idx, 1);
  }
  return true;
}

// =================== ADMIN ===================

export async function getAdminByUsername(username: string): Promise<Admin | null> {
  const mongo = await getMongoDb();
  if (mongo) {
    try {
      const row = await mongo.collection<Admin>('admins').findOne({ username });
      if (row) {
        return {
          id: row.id,
          username: row.username,
          password: row.password,
          created_at: row.created_at,
        };
      }
    } catch (err) {
      console.warn('[Queries] Could not query admin from MongoDB:', err);
    }
  }

  const pool = getDbPool();
  if (pool) {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id, username, password, created_at FROM admins WHERE username = ? LIMIT 1',
        [username]
      );
      if (rows && rows.length > 0) {
        return rows[0] as unknown as Admin;
      }
    } catch (err) {
      console.warn('[Queries] Could not query admin from MySQL:', err);
    }
  }

  if (username === DEFAULT_ADMIN.username) {
    return {
      id: DEFAULT_ADMIN.id,
      username: DEFAULT_ADMIN.username,
      password: DEFAULT_ADMIN.password,
      created_at: new Date('2026-01-01T00:00:00Z'),
    };
  }
  return null;
}
