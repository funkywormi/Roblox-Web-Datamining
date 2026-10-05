export interface BaseRegistry<K, V> {
  register(key: K, value: V): void;
  registerAll(entries: Record<string, V | undefined>): void;
  get(key: K): V | undefined;
  has(key: K): boolean;
  keys(): K[];
  lock(): void;
  isLocked(): boolean;
}

export interface CreateBaseRegistryOptions<K> {
  lockedMessage: string;
  /** Convert `Object.entries` string keys (numeric enums) into the map key. */
  parseKey: (rawKey: string) => K;
}

/**
 * Shared base for the named SDUI registries: a keyed map that stops accepting
 * writes once composition seals it. Public APIs stay on the typed wrappers so
 * callers never depend on this helper.
 */
export function createBaseRegistry<K, V>(
  options: CreateBaseRegistryOptions<K>,
): BaseRegistry<K, V> {
  const { lockedMessage, parseKey } = options;
  const entries = new Map<K, V>();
  let locked = false;

  const assertUnlocked = (): void => {
    if (locked) {
      throw new Error(lockedMessage);
    }
  };

  return {
    register(key, value) {
      assertUnlocked();
      entries.set(key, value);
    },

    registerAll(batch) {
      assertUnlocked();
      for (const [rawKey, value] of Object.entries(batch)) {
        if (value === undefined) continue;
        entries.set(parseKey(rawKey), value);
      }
    },

    get(key) {
      return entries.get(key);
    },

    has(key) {
      return entries.has(key);
    },

    keys() {
      return [...entries.keys()];
    },

    lock() {
      locked = true;
    },

    isLocked() {
      return locked;
    },
  };
}
