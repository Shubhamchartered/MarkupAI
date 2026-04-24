/**
 * crypto_util.js — AES-256-CBC credential encryption
 * Used to encrypt GST portal passwords + IT passwords at rest.
 * 
 * ENCRYPTION_KEY must be 64 hex chars (32 bytes) in .env.local
 * Encrypted values are stored as: "enc:iv_hex:cipher_hex"
 */

import crypto from 'crypto';

const ALGO = 'aes-256-cbc';
const KEY_HEX = process.env.ENCRYPTION_KEY;

function getKey() {
  if (!KEY_HEX || KEY_HEX.length !== 64) {
    // Fallback: derive a deterministic key from a fixed seed
    // NOT recommended for production — add ENCRYPTION_KEY to .env.local
    return crypto.createHash('sha256').update('MARKUP_AI_DEFAULT_ENCRYPTION_SEED_2024').digest();
  }
  return Buffer.from(KEY_HEX, 'hex');
}

/**
 * Encrypt plaintext password → "enc:iv:ciphertext" format
 * @param {string} plaintext
 * @returns {string} encrypted string
 */
export function encrypt(plaintext) {
  if (!plaintext) return '';
  if (isEncrypted(plaintext)) return plaintext; // already encrypted
  try {
    const key = getKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGO, key, iv);
    const encrypted = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
    return `enc:${iv.toString('hex')}:${encrypted.toString('hex')}`;
  } catch {
    return plaintext; // fallback on error
  }
}

/**
 * Decrypt "enc:iv:ciphertext" back to plaintext
 * @param {string} encrypted
 * @returns {string} plaintext or empty string on failure
 */
export function decrypt(encrypted) {
  if (!encrypted) return '';
  if (!isEncrypted(encrypted)) return encrypted; // plain text
  try {
    const [, ivHex, cipherHex] = encrypted.split(':');
    const key = getKey();
    const iv = Buffer.from(ivHex, 'hex');
    const ciphertext = Buffer.from(cipherHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  } catch {
    return '';
  }
}

/**
 * Check if a string is already encrypted by this utility
 * @param {string} str
 * @returns {boolean}
 */
export function isEncrypted(str) {
  return typeof str === 'string' && str.startsWith('enc:') && str.split(':').length === 3;
}

/**
 * Mask a string for UI display — always shows bullets
 * @param {string} str
 * @returns {string} "••••••••"
 */
export function mask(str) {
  if (!str) return '—';
  return '••••••••';
}
