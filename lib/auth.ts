import crypto from 'crypto';
import { cookies } from 'next/headers';

const AUTH_SECRET = process.env.AUTH_SECRET || 'ceramix-3d-secret-key-production-2026-super-secure';
const COOKIE_NAME = 'ceramix_admin_token';

export interface AdminSession {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'ARTISAN';
}

/**
 * Hash a plain password with random salt using scrypt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify a plain password against the stored salt:derivedKey
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(key, 'hex');
    return crypto.timingSafeEqual(derivedKey, keyBuffer);
  } catch {
    return false;
  }
}

/**
 * Create a HMAC-SHA256 signed session token
 */
export function createSessionToken(payload: AdminSession): string {
  const data = Buffer.from(
    JSON.stringify({
      ...payload,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiry
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(data)
    .digest('base64url');

  return `${data}.${signature}`;
}

/**
 * Verify and decode HMAC session token
 */
export function verifySessionToken(token: string): AdminSession | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(data)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const decoded = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (Date.now() > decoded.exp) return null;

    return {
      id: decoded.id,
      email: decoded.email,
      fullName: decoded.fullName,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

/**
 * Get current session from Next.js server cookie
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export { COOKIE_NAME };
