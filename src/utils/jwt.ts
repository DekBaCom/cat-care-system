import type { User } from '../types';

const EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;

function b64url(input: string): string {
  return btoa(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function b64urlDecode(input: string): string {
  return atob(input.replace(/-/g, '+').replace(/_/g, '/'));
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function createToken(user: Pick<User, 'id' | 'email' | 'name'>, secret: string): Promise<string> {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ id: user.id, email: user.email, name: user.name, exp: Math.floor(Date.now() / 1000) + EXPIRES_IN_SECONDS, iat: Math.floor(Date.now() / 1000) }));
  const message = `${header}.${payload}`;
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return `${message}.${b64url(String.fromCharCode(...new Uint8Array(sig)))}`;
}

export async function verifyToken(token: string, secret: string): Promise<{ id: string; email: string; name: string }> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');
  const [header, payloadB64, sigB64] = parts as [string, string, string];
  const message = `${header}.${payloadB64}`;
  const key = await hmacKey(secret);
  const sigBytes = Uint8Array.from(b64urlDecode(sigB64), (c) => c.charCodeAt(0));
  const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(message));
  if (!valid) throw new Error('Invalid token signature');
  const payload = JSON.parse(b64urlDecode(payloadB64)) as { id: string; email: string; name: string; exp: number };
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
  return { id: payload.id, email: payload.email, name: payload.name };
}

export function parseAuthHeader(authHeader: string | null | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}
