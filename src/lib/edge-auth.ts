import { createHash, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Hashes a password using SHA-256 with a salt
 * This is a simpler alternative to bcrypt for Edge compatibility
 */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  // Create a salt if not provided
  const passwordSalt = salt || randomBytes(16).toString('hex');

  // Create hash
  const hash = createHash('sha256')
    .update(password + passwordSalt)
    .digest('hex');

  return { hash, salt: passwordSalt };
}

/**
 * Verifies a password against a stored hash and salt
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  const { hash } = hashPassword(password, salt);

  // Use timing-safe comparison to prevent timing attacks
  try {
    return timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(storedHash, 'hex')
    );
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

/**
 * Generates a random token for password reset
 */
export function generateToken(): { token: string; hashedToken: string } {
  const token = randomBytes(32).toString('hex');
  const hashedToken = createHash('sha256')
    .update(token)
    .digest('hex');

  return { token, hashedToken };
}

/**
 * Creates an expiration date for tokens
 */
export function createExpirationDate(hours = 1): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
