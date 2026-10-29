import { MongoClient, Db } from 'mongodb';
import {
  DEFAULT_CONTENT_ROWS,
  DEFAULT_GALLERY_ITEMS,
  DEFAULT_INTEL_FEEDS,
  DEFAULT_CHAT_CONTACTS,
  DEFAULT_CHAT_MESSAGES,
  DEFAULT_ADMIN,
} from './defaults';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | null = null;
let isInitialized = false;

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI || process.env.MONGO_URI);
}

export function getMongoDbName(): string {
  if (process.env.MONGODB_DB) {
    return process.env.MONGODB_DB;
  }
  const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
  try {
    const url = new URL(rawUri);
    const pathname = url.pathname.replace(/^\//, '');
    if (pathname) {
      return pathname.split('?')[0];
    }
  } catch {
    // fallback
  }
  return 'nexus_intel';
}

export function getMongoClientPromise(): Promise<MongoClient> | null {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) return null;

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 10000,
      });
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  if (!clientPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function ensureMongoCollectionsAndSeed(db: Db): Promise<string[]> {
  // 1. site_content
  const siteContentCol = db.collection('site_content');
  await siteContentCol.createIndex({ content_key: 1 }, { unique: true }).catch(() => {});
  await siteContentCol.createIndex({ id: 1 }, { unique: true }).catch(() => {});
  if ((await siteContentCol.countDocuments()) === 0) {
    const ops = DEFAULT_CONTENT_ROWS.map((item) => ({
      updateOne: {
        filter: { content_key: item.content_key },
        update: { $setOnInsert: { ...item } },
        upsert: true,
      },
    }));
    await siteContentCol.bulkWrite(ops, { ordered: false }).catch(() => {});
  }

  // 2. gallery
  const galleryCol = db.collection('gallery');
  await galleryCol.createIndex({ id: 1 }, { unique: true }).catch(() => {});
  if ((await galleryCol.countDocuments()) === 0) {
    const ops = DEFAULT_GALLERY_ITEMS.map((item) => ({
      updateOne: {
        filter: { id: item.id },
        update: { $setOnInsert: { ...item } },
        upsert: true,
      },
    }));
    await galleryCol.bulkWrite(ops, { ordered: false }).catch(() => {});
  }

  // 3. intel_feeds
  const feedsCol = db.collection('intel_feeds');
  await feedsCol.createIndex({ id: 1 }, { unique: true }).catch(() => {});
  if ((await feedsCol.countDocuments()) === 0) {
    const ops = DEFAULT_INTEL_FEEDS.map((item) => ({
      updateOne: {
        filter: { id: item.id },
        update: { $setOnInsert: { ...item } },
        upsert: true,
      },
    }));
    await feedsCol.bulkWrite(ops, { ordered: false }).catch(() => {});
  }

  // 4. chat_contacts
  const contactsCol = db.collection('chat_contacts');
  await contactsCol.createIndex({ id: 1 }, { unique: true }).catch(() => {});
  if ((await contactsCol.countDocuments()) === 0) {
    const ops = DEFAULT_CHAT_CONTACTS.map((item) => ({
      updateOne: {
        filter: { id: item.id },
        update: { $setOnInsert: { ...item } },
        upsert: true,
      },
    }));
    await contactsCol.bulkWrite(ops, { ordered: false }).catch(() => {});
  }

  // 5. chat_messages
  const messagesCol = db.collection('chat_messages');
  await messagesCol.createIndex({ id: 1 }, { unique: true }).catch(() => {});
  await messagesCol.createIndex({ contact_id: 1 }).catch(() => {});
  if ((await messagesCol.countDocuments()) === 0) {
    const ops = DEFAULT_CHAT_MESSAGES.map((item) => ({
      updateOne: {
        filter: { id: item.id },
        update: { $setOnInsert: { ...item } },
        upsert: true,
      },
    }));
    await messagesCol.bulkWrite(ops, { ordered: false }).catch(() => {});
  }

  // 6. admins
  const adminsCol = db.collection('admins');
  await adminsCol.createIndex({ username: 1 }, { unique: true }).catch(() => {});
  await adminsCol.createIndex({ id: 1 }, { unique: true }).catch(() => {});
  if ((await adminsCol.countDocuments()) === 0) {
    await adminsCol.updateOne(
      { username: DEFAULT_ADMIN.username },
      {
        $setOnInsert: {
          id: DEFAULT_ADMIN.id,
          username: DEFAULT_ADMIN.username,
          password: DEFAULT_ADMIN.password,
          created_at: new Date('2026-01-01T00:00:00Z'),
        },
      },
      { upsert: true }
    ).catch(() => {});
  }

  return (await db.listCollections().toArray()).map((c) => c.name);
}

export async function getMongoDb(): Promise<Db | null> {
  const promise = getMongoClientPromise();
  if (!promise) return null;

  try {
    const connectedClient = await promise;
    const db = connectedClient.db(getMongoDbName());

    if (!isInitialized) {
      try {
        await ensureMongoCollectionsAndSeed(db);
        isInitialized = true;
      } catch (err) {
        console.error('[MongoDB] Initialization error:', err);
      }
    }

    return db;
  } catch (err) {
    console.error('[MongoDB] Failed to connect:', err);
    return null;
  }
}

export async function getNextNumericId(db: Db, collectionName: string): Promise<number> {
  const highest = await db
    .collection(collectionName)
    .find({}, { projection: { id: 1 } })
    .sort({ id: -1 })
    .limit(1)
    .toArray();

  if (highest.length > 0 && typeof highest[0].id === 'number') {
    return highest[0].id + 1;
  }
  return 1;
}

export async function checkMongoConnection(): Promise<{
  ok: boolean;
  configured: boolean;
  tables?: string[];
  error?: string;
}> {
  if (!isMongoConfigured()) {
    return { ok: false, configured: false, error: 'MongoDB URI is not configured.' };
  }

  try {
    const db = await getMongoDb();
    if (!db) {
      return { ok: false, configured: true, error: 'Could not connect to MongoDB database.' };
    }
    await db.command({ ping: 1 });
    const collections = await ensureMongoCollectionsAndSeed(db);
    return {
      ok: true,
      configured: true,
      tables: collections,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      configured: true,
      error: message,
    };
  }
}
