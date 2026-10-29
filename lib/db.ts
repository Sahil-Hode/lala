import mysql, { Pool } from 'mysql2/promise';
import { isMongoConfigured, checkMongoConnection, getMongoDb } from './mongodb';

let pool: Pool | null = null;

export function isMysqlConfigured(): boolean {
  return Boolean(
    process.env.DB_HOST &&
    process.env.DB_NAME &&
    process.env.DB_USER
  );
}

export function isDbConfigured(): boolean {
  return isMongoConfigured() || isMysqlConfigured();
}

export function getDatabaseDriver(): 'mongodb' | 'mysql' | 'none' {
  if (isMongoConfigured()) return 'mongodb';
  if (isMysqlConfigured()) return 'mysql';
  return 'none';
}

export function getDbPool(): Pool | null {
  if (!isMysqlConfigured()) {
    return null;
  }

  if (!pool) {
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        connectTimeout: 5000,
      });
    } catch (err) {
      console.error('[DB] Failed to initialize MySQL pool:', err);
      pool = null;
    }
  }

  return pool;
}

export async function checkDbConnection(): Promise<{
  ok: boolean;
  configured: boolean;
  type?: 'mongodb' | 'mysql' | 'none';
  tables?: string[];
  error?: string;
}> {
  if (isMongoConfigured()) {
    const mongoRes = await checkMongoConnection();
    return {
      ...mongoRes,
      type: 'mongodb',
    };
  }

  if (isMysqlConfigured()) {
    const p = getDbPool();
    if (!p) {
      return {
        ok: false,
        configured: true,
        type: 'mysql',
        error: 'Could not create connection pool.',
      };
    }

    try {
      const [rows] = await p.query('SHOW TABLES');
      const tables = (rows as Array<Record<string, unknown>>).map((r) =>
        Object.values(r)[0] as string
      );
      return {
        ok: true,
        configured: true,
        type: 'mysql',
        tables,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        configured: true,
        type: 'mysql',
        error: message,
      };
    }
  }

  return {
    ok: false,
    configured: false,
    type: 'none',
    error: 'Database environment variables are not configured.',
  };
}

export { getMongoDb };
