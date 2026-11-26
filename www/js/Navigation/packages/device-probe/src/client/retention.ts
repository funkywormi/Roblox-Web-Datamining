// Removing what the probe stored. Local storage has no expiry of its own, so entries are removed
// on the next www.roblox.com page load once they're RETENTION_MS old. A device that never loads a
// www page again keeps them until its site data is cleared. Covers every version's key, not just
// this client's, so entries an older or newer bundle wrote are removed too.
import { window } from "@rbx/core-lib/browser";

/**
 * A stored result is used for at most this long, and an entry this old, of any version, is
 * removed on the next page load.
 */
export const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

// How far in the future an entry's time may be before it's removed, so a small clock correction
// doesn't remove the failure backoff. Readers still ignore any entry from the future.
const FUTURE_TOLERANCE_MS = 60 * 1000;

/** The key an older client used before it was versioned; the prefix of every versioned one. */
export const UNVERSIONED_KEY = "RBX_WASM_DEVICE_PROBE";
const VERSIONED_KEY_PREFIX = `${UNVERSIONED_KEY}_`;

const probeKeys = (storage: Storage): string[] => {
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key === UNVERSIONED_KEY || key?.startsWith(VERSIONED_KEY_PREFIX) === true) {
      keys.push(key);
    }
  }
  return keys;
};

// When the entry was written: `measuredAt` for a measurement, `failedAt` for a failure entry or a
// crash marker. `null` when it has neither, so its age is unknown.
const writtenAt = (raw: string | null): number | null => {
  try {
    const entry: unknown = JSON.parse(raw ?? "null");
    if (typeof entry !== "object" || entry === null) {
      return null;
    }
    const measuredAt: unknown = Reflect.get(entry, "measuredAt");
    const at: unknown =
      typeof measuredAt === "number" ? measuredAt : Reflect.get(entry, "failedAt");
    return typeof at === "number" && Number.isFinite(at) ? at : null;
  } catch {
    return null;
  }
};

// Storage can be blocked, which throws on access.
const withStorage = (callback: (storage: Storage) => void): void => {
  try {
    const storage = window?.localStorage;
    if (storage != null) {
      callback(storage);
    }
  } catch {
    // Nothing can be stored either.
  }
};

/**
 * Removes every probe entry, of any version, written {@link RETENTION_MS} or more ago, more than a
 * minute in the future (the clock moved back), or that can't be read, plus the unversioned one.
 */
export const removeExpiredProbeEntries = (now: number): void => {
  withStorage(storage => {
    for (const key of probeKeys(storage)) {
      const at = key === UNVERSIONED_KEY ? null : writtenAt(storage.getItem(key));
      const age = at == null ? Number.NaN : now - at;
      if (!(age >= -FUTURE_TOLERANCE_MS && age < RETENTION_MS)) {
        storage.removeItem(key);
      }
    }
  });
};
