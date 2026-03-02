import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ExpiryStatus } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getExpiryStatus(dateString: string): ExpiryStatus {
  const expiry = new Date(dateString);
  const now = new Date();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  if (expiry < now) return 'expired';
  if (expiry.getTime() - now.getTime() <= thirtyDays) return 'expiring';
  return 'valid';
}

export function generateId(): string {
  // crypto.randomUUID requires secure context (HTTPS) — provide UUID v4 fallback for HTTP
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try { return crypto.randomUUID(); } catch { /* fall through */ }
  }
  // UUID v4 fallback using crypto.getRandomValues (works on HTTP)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 1
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  // Last resort: Math.random-based UUID (not cryptographically secure but valid format)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
