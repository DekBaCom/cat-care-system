import { v4 as uuidv4 } from 'uuid';
import type { Env, User } from '../types';
import { queryOne, execute } from '../utils/db';
import { createToken } from '../utils/jwt';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { DUPLICATE_EMAIL, INVALID_CREDENTIALS, NOT_FOUND } from '../utils/errors';

interface UserRow { id: string; email: string; password_hash: string; name: string; line_user_id: string | null; timezone: string; language: string; created_at: string; updated_at: string; }

function rowToUser(r: UserRow): User {
  return { id: r.id, email: r.email, passwordHash: r.password_hash, name: r.name, lineUserId: r.line_user_id ?? undefined, timezone: r.timezone, language: r.language, createdAt: r.created_at, updatedAt: r.updated_at };
}

export class AuthService {
  static async register(email: string, password: string, name: string, env: Env): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const existing = await queryOne<{ id: string }>(env.DB, 'SELECT id FROM users WHERE email = ?', [email]);
    if (existing) throw DUPLICATE_EMAIL;
    const passwordHash = await hashPassword(password);
    const id = uuidv4();
    const now = new Date().toISOString();
    await execute(env.DB, 'INSERT INTO users (id, email, password_hash, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)', [id, email, passwordHash, name, now, now]);
    const row = await queryOne<UserRow>(env.DB, 'SELECT * FROM users WHERE id = ?', [id]);
    const user = rowToUser(row!);
    const token = await createToken(user, env.JWT_SECRET);
    const { passwordHash: _ph, ...safeUser } = user;
    return { user: safeUser, token };
  }

  static async login(email: string, password: string, env: Env): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const row = await queryOne<UserRow>(env.DB, 'SELECT * FROM users WHERE email = ?', [email]);
    if (!row) throw INVALID_CREDENTIALS;
    const match = await verifyPassword(password, row.password_hash);
    if (!match) throw INVALID_CREDENTIALS;
    const user = rowToUser(row);
    const token = await createToken(user, env.JWT_SECRET);
    const { passwordHash: _ph, ...safeUser } = user;
    return { user: safeUser, token };
  }

  static async connectLineAccount(userId: string, lineUserId: string, env: Env): Promise<Omit<User, 'passwordHash'>> {
    await execute(env.DB, 'UPDATE users SET line_user_id = ?, updated_at = ? WHERE id = ?', [lineUserId, new Date().toISOString(), userId]);
    const row = await queryOne<UserRow>(env.DB, 'SELECT * FROM users WHERE id = ?', [userId]);
    if (!row) throw NOT_FOUND;
    const { passwordHash: _ph, ...safeUser } = rowToUser(row);
    return safeUser;
  }

  static async disconnectLine(userId: string, env: Env): Promise<void> {
    await execute(env.DB, 'UPDATE users SET line_user_id = NULL, updated_at = ? WHERE id = ?', [new Date().toISOString(), userId]);
  }

  static async getLineStatus(userId: string, env: Env): Promise<{ connected: boolean }> {
    const row = await queryOne<{ line_user_id: string | null }>(env.DB, 'SELECT line_user_id FROM users WHERE id = ?', [userId]);
    return { connected: !!row?.line_user_id };
  }
}
