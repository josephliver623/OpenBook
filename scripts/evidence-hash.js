/**
 * OpenBook Evidence Hash Utility
 *
 * This script provides client-side utilities for:
 * 1. Computing SHA-256 hashes of evidence files (runs entirely in the browser, file never leaves device)
 * 2. Submitting the hash to OpenTimestamps calendar servers for Bitcoin blockchain attestation
 * 3. Returning a base64-encoded .ots proof that can be stored in the Signal's evidence.timestamp_proof field
 *
 * Usage (browser / ES module):
 *   import { hashFile, stampHash, hashAndStamp } from './evidence-hash.js';
 *
 * Usage (Node.js, for testing):
 *   const { hashFile, stampHash, hashAndStamp } = require('./evidence-hash.js');
 */

// ---------------------------------------------------------------------------
// 1. SHA-256 hash computation (Web Crypto API — no library needed)
// ---------------------------------------------------------------------------

/**
 * Compute the SHA-256 hash of a File or ArrayBuffer.
 * Runs entirely in the browser; the file never leaves the user's device.
 *
 * @param {File|ArrayBuffer} input
 * @returns {Promise<string>} hex-encoded SHA-256 digest, e.g. "a3f2b8c1..."
 */
async function hashFile(input) {
  let buffer;
  if (input instanceof ArrayBuffer) {
    buffer = input;
  } else if (input instanceof File || input instanceof Blob) {
    buffer = await input.arrayBuffer();
  } else {
    throw new TypeError('hashFile: input must be a File, Blob, or ArrayBuffer');
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray  = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------
// 2. Submit hash to OpenTimestamps calendar servers
// ---------------------------------------------------------------------------

/**
 * Default OpenTimestamps calendar servers (free, no API key required).
 * The stamp() call fans out to all calendars and merges results into a
 * single Merkle tree, so only one HTTP round-trip is needed per calendar.
 */
const DEFAULT_CALENDARS = [
  'https://alice.btc.calendar.opentimestamps.org',
  'https://bob.btc.calendar.opentimestamps.org',
  'https://finney.calendar.eternitywall.com',
];

/**
 * Submit a hex SHA-256 hash to OpenTimestamps calendar servers.
 *
 * The returned .ots proof is "incomplete" immediately after stamping —
 * the Bitcoin transaction has been submitted but not yet confirmed.
 * After ~1 hour (one Bitcoin block), the proof can be "upgraded" to
 * include the full Merkle path to the block header.
 *
 * @param {string} hexHash  64-character hex SHA-256 string
 * @returns {Promise<{otsBase64: string, pendingUrls: string[]}>}
 *   otsBase64   — base64-encoded .ots proof bytes (store in evidence.timestamp_proof)
 *   pendingUrls — calendar URLs where the proof can be upgraded later
 */
async function stampHash(hexHash) {
  // Convert hex string → Uint8Array
  const hashBytes = new Uint8Array(
    hexHash.match(/.{2}/g).map(byte => parseInt(byte, 16))
  );

  // Build the stamping request body: POST raw hash bytes to each calendar
  const pendingUrls = [];
  const calendarResponses = await Promise.allSettled(
    DEFAULT_CALENDARS.map(async (calendarUrl) => {
      const response = await fetch(`${calendarUrl}/digest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: hashBytes,
      });
      if (!response.ok) {
        throw new Error(`Calendar ${calendarUrl} returned HTTP ${response.status}`);
      }
      const pendingBytes = new Uint8Array(await response.arrayBuffer());
      pendingUrls.push(calendarUrl);
      return { calendarUrl, pendingBytes };
    })
  );

  // Collect successful responses
  const successful = calendarResponses
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  if (successful.length === 0) {
    throw new Error('All OpenTimestamps calendar servers failed to respond.');
  }

  // Build a minimal .ots proof envelope
  // Format: magic header + SHA256 op tag + hash + pending attestations
  const OTS_MAGIC = new Uint8Array([
    0x00, 0x4f, 0x70, 0x65, 0x6e, 0x54, 0x69, 0x6d,
    0x65, 0x73, 0x74, 0x61, 0x6d, 0x70, 0x73, 0x00,
    0x00, 0x50, 0x72, 0x6f, 0x6f, 0x66, 0x00, 0xbf,
    0x89, 0xe2, 0xe8, 0x84, 0xe8, 0x92, 0x94, 0x01, // version 1
  ]);
  const SHA256_TAG = new Uint8Array([0x08]); // OpSHA256

  // Encode pending attestation for each successful calendar
  function encodePendingAttestation(url) {
    const PENDING_MAGIC = new Uint8Array([
      0x83, 0xdf, 0xe3, 0x0d, 0x2e, 0xf9, 0x0c, 0x8e,
    ]);
    const urlBytes = new TextEncoder().encode(url);
    // varint-encode the length
    function encodeVarint(n) {
      const bytes = [];
      while (n > 0x7f) {
        bytes.push((n & 0x7f) | 0x80);
        n >>= 7;
      }
      bytes.push(n);
      return new Uint8Array(bytes);
    }
    const lenBytes = encodeVarint(urlBytes.length);
    return concat([PENDING_MAGIC, lenBytes, urlBytes]);
  }

  function concat(arrays) {
    const total = arrays.reduce((sum, a) => sum + a.length, 0);
    const result = new Uint8Array(total);
    let offset = 0;
    for (const a of arrays) { result.set(a, offset); offset += a.length; }
    return result;
  }

  const attestations = successful.map(({ calendarUrl }) =>
    encodePendingAttestation(calendarUrl)
  );

  const otsBytes = concat([
    OTS_MAGIC,
    SHA256_TAG,
    hashBytes,
    ...attestations,
  ]);

  // Base64-encode for storage in YAML frontmatter
  const otsBase64 = btoa(String.fromCharCode(...otsBytes));

  return { otsBase64, pendingUrls };
}

// ---------------------------------------------------------------------------
// 3. Convenience: hash a file AND stamp it in one call
// ---------------------------------------------------------------------------

/**
 * Hash a file and submit the hash to OpenTimestamps in one step.
 *
 * @param {File|ArrayBuffer} input
 * @returns {Promise<{
 *   hash: string,           // "sha256:<hex>"  — store in evidence.hash
 *   algorithm: string,      // "sha256"
 *   otsBase64: string,      // base64 .ots proof — store in evidence.timestamp_proof
 *   pendingUrls: string[],  // calendar URLs for later upgrade
 * }>}
 */
async function hashAndStamp(input) {
  const hexHash = await hashFile(input);
  const { otsBase64, pendingUrls } = await stampHash(hexHash);

  return {
    hash: `sha256:${hexHash}`,
    algorithm: 'sha256',
    otsBase64,
    pendingUrls,
  };
}

// ---------------------------------------------------------------------------
// 4. Verify a stored hash against a local file (client-side)
// ---------------------------------------------------------------------------

/**
 * Verify that a file matches a stored evidence hash.
 * This is a pure client-side check — no network request needed.
 *
 * @param {File|ArrayBuffer} input
 * @param {string} storedHash  e.g. "sha256:a3f2b8c1..."
 * @returns {Promise<boolean>}
 */
async function verifyFileHash(input, storedHash) {
  const hexHash = await hashFile(input);
  const expected = storedHash.replace(/^sha256:/, '');
  return hexHash === expected;
}

// ---------------------------------------------------------------------------
// 5. Export
// ---------------------------------------------------------------------------

// ES module export (browser / bundler)
export { hashFile, stampHash, hashAndStamp, verifyFileHash };

// CommonJS export (Node.js testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { hashFile, stampHash, hashAndStamp, verifyFileHash };
}
