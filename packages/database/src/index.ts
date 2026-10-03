import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index';

export * from './schema/index';
export { eq, and, or, desc, asc, sql } from 'drizzle-orm';

let pool: Pool | null = null;
let dbInstance: NodePgDatabase<typeof schema> | null = null;

export function getDb(connectionString?: string): NodePgDatabase<typeof schema> {
  if (!dbInstance) {
    const url = connectionString || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/eduyug';
    pool = new Pool({
      connectionString: url,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    dbInstance = drizzle(pool, { schema });
  }
  return dbInstance;
}

export type EduYugDb = NodePgDatabase<typeof schema>;
