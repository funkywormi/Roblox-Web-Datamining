/**
 * Session fields a page can store
 */
export const SDUI_SESSION_KEYS = [
  "homePageSessionInfo",
  // Renamed to `gameSearchSessionInfo` when an event is sent.
  "omniSearchSessionInfo",
  "discoverPageSessionInfo",
  "searchLandingPageSessionInfo",
  "spotlightPageSessionInfo",
  "preAuthLandingPageSessionInfo",
] as const;

export type SduiSessionKey = (typeof SDUI_SESSION_KEYS)[number];

export type SduiSessionData = Partial<Record<SduiSessionKey, string>>;

/**
 * Page-scoped session values that the owning service populates and the
 * session-attributing analytics reporter reads at send time.
 */
export class SduiSessionStore {
  private readonly values = new Map<SduiSessionKey, string>();

  constructor(initialData?: SduiSessionData) {
    if (initialData) this.update(initialData);
  }

  /** Set one key; an empty or missing value removes it. */
  set(key: SduiSessionKey, value: string | undefined): void {
    if (value) {
      this.values.set(key, value);
    } else {
      this.values.delete(key);
    }
  }

  /** Apply each provided key with `set` semantics; omitted keys are untouched. */
  update(data: SduiSessionData): void {
    for (const key of SDUI_SESSION_KEYS) {
      if (key in data) this.set(key, data[key]);
    }
  }

  get(key: SduiSessionKey): string | undefined {
    return this.values.get(key);
  }

  getSessionData(): SduiSessionData {
    const data: SduiSessionData = {};
    for (const key of SDUI_SESSION_KEYS) {
      const value = this.values.get(key);
      if (value) data[key] = value;
    }
    return data;
  }

  clear(): void {
    this.values.clear();
  }
}
