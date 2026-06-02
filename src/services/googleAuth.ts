import { v4 as uuidv4 } from 'uuid';
import type { Env, User } from '../types';
import { queryOne, execute } from '../utils/db';
import { createToken } from '../utils/jwt';

const JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const JWKS_CACHE_KEY = 'google:jwks';
const JWKS_CACHE_TTL = 3600;

interface JWK {
  kid: string; kty: string; alg: string; use: string;
  n: string; e: string;
}

interface GoogleIdTokenPayload {
  iss: string; aud: string; sub: string; email: string;
  email_verified: boolean; name: string; picture?: string;
  exp: number; iat: number;
}

interface UserRow {
  id: string; email: string; password_hash: string; name: string;
  line_user_id: string | null; timezone: string; language: string;
  created_at: string; updated_at: string;
}

function b64urlDecodeToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function b64urlDecodeToString(s: string): string {
  return new TextDecoder().decode(b64urlDecodeToBytes(s));
}

async function getGoogleJwks(env: Env): Promise<JWK[]> {
  const cached = await env.KV_CACHE.get(JWKS_CACHE_KEY);
  if (cached) return JSON.parse(cached).keys as JWK[];
  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error('Failed to fetch Google JWKS');
  const text = await res.text();
  await env.KV_CACHE.put(JWKS_CACHE_KEY, text, { expirationTtl: JWKS_CACHE_TTL });
  return (JSON.parse(text) as { keys: JWK[] }).keys;
}

async function importJwk(jwk: JWK): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
}

export async function verifyGoogleIdToken(idToken: string, env: Env): Promise<GoogleIdTokenPayload> {
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');
  const [headerB64, payloadB64, sigB64] = parts as [string, string, string];

  const header = JSON.parse(b64urlDecodeToString(headerB64)) as { kid: string; alg: string };
  if (header.alg !== 'RS256') throw new Error('Unsupported algorithm');

  const jwks = await getGoogleJwks(env);
  const jwk = jwks.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error('Signing key not found');

  const key = await importJwk(jwk);
  const sig = b64urlDecodeToBytes(sigB64);
  const data = new TextEncoder().encode(headerB64 + '.' + payloadB64);
  const valid = await crypto.subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, key, sig, data);
  if (!valid) throw new Error('Invalid token signature');

  const payload = JSON.parse(b64urlDecodeToString(payloadB64)) as GoogleIdTokenPayload;
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) throw new Error('Token expired');
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)) {
    throw new Error('Invalid issuer');
  }
  if (env.GOOGLE_CLIENT_ID && payload.aud !== env.GOOGLE_CLIENT_ID) {
    throw new Error('Invalid audience');
  }
  if (!payload.email_verified) throw new Error('Email not verified');

  return payload;
}

function rowToSafeUser(r: UserRow): Omit<User, 'passwordHash'> {
  return {
    id: r.id, email: r.email, name: r.name,
    lineUserId: r.line_user_id ?? undefined,
    timezone: r.timezone, language: r.language,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function isEmailAllowed(email: string, allowlist: string | undefined): boolean {
  if (!allowlist) return true;
  const allowed = allowlist.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (allowed.length === 0) return true;
  const target = email.toLowerCase();
  return allowed.some((entry) => entry.startsWith('@') ? target.endsWith(entry) : target === entry);
}

export async function loginOrRegisterGoogleUser(idToken: string, env: Env): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
  const payload = await verifyGoogleIdToken(idToken, env);

  if (!isEmailAllowed(payload.email, env.ALLOWED_EMAILS)) {
    throw new Error('อีเมลนี้ไม่ได้รับอนุญาตให้เข้าใช้งานระบบ');
  }

  let row = await queryOne<UserRow>(env.DB, 'SELECT * FROM users WHERE email = ?', [payload.email]);

  if (!row) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const placeholder = 'GOOGLE_AUTH:' + payload.sub;
    await execute(
      env.DB,
      'INSERT INTO users (id, email, password_hash, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, payload.email, placeholder, payload.name, now, now],
    );
    row = await queryOne<UserRow>(env.DB, 'SELECT * FROM users WHERE id = ?', [id]);
  }

  const user = rowToSafeUser(row!);
  const token = await createToken(user, env.JWT_SECRET);
  return { user, token };
}
