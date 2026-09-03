const STORAGE_KEY = 'icr_verification_token';

/**
 * Returns the stored ICR verification JWT, or null if missing/SSR.
 */
export function getStoredVerificationToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Stores the ICR verification JWT in localStorage.
 */
export function setStoredVerificationToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // ignore
  }
}
