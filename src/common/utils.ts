/**
 * Utility functions for the application
 */

/**
 * Generate a random instance ID
 */
export function generateInstanceId(): string {
  return `inst_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Calculate expiration date (default: 1 week from now)
 */
export function calculateExpirationDate(daysFromNow: number = 7): string {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + daysFromNow);
  return expirationDate.toISOString();
}

/**
 * Calculate seconds until expiration
 */
export function calculateExpirationSeconds(expirationDate: string): number {
  const now = new Date();
  const expiration = new Date(expirationDate);
  return Math.max(0, Math.floor((expiration.getTime() - now.getTime()) / 1000));
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if a value is a plain object
 */
export function isPlainObject(value: any): boolean {
  return value !== null && typeof value === 'object' && value.constructor === Object;
}
