/**
 * Hashes a PIN using SHA-256 (Web Crypto API — available in all modern browsers and Capacitor).
 * Using crypto.subtle to protect against accidental exposure of raw PINs.
 * Note: SHA-256 is sufficient here since PINs are short-lived game tokens, not passwords.
 * For long-term credential storage, prefer Argon2/bcrypt.
 */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
