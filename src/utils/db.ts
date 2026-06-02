export async function query<T>(db: D1Database, sql: string, params: unknown[] = []): Promise<T[]> {
  try {
    const result = await db.prepare(sql).bind(...params).all<T>();
    return result.results;
  } catch (error) {
    console.error('[DB] Query error:', sql, error);
    throw error;
  }
}

export async function queryOne<T>(db: D1Database, sql: string, params: unknown[] = []): Promise<T | null> {
  const results = await query<T>(db, sql, params);
  return results[0] ?? null;
}

export async function execute(db: D1Database, sql: string, params: unknown[] = []): Promise<{ success: boolean; changes?: number }> {
  try {
    const result = await db.prepare(sql).bind(...params).run();
    return { success: result.success, changes: result.meta.changes };
  } catch (error) {
    console.error('[DB] Execute error:', sql, error);
    throw error;
  }
}
