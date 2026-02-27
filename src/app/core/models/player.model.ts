export interface Player {
  id: string;
  name: string;
  avatarColor: string;
  /** SHA-256 hash of the PIN (using crypto.subtle — never stored as plain text) */
  pinHash: string;
  score: number;
}
