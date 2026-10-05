import { batch } from "@preact/signals-core";
import type { EntityData } from "../../../types";
import { UnkeyedStore } from "../UnkeyedStore";

/** Content-type key under which localized literals are registered on the binder. */
export const LOCALIZED_LITERALS_CONTENT_TYPE = "localizedLiterals";

/**
 * Shape of the localized literals record: an open map of `mapKey → string`.
 * The `[key: string]: string` index signature is what the runtime stores;
 * non-string values in incoming payloads are filtered defensively.
 */
export type LocalizedLiteralsData = Record<string, string>;

/**
 * Browser: lazy process singleton — shared across services bundles
 *
 * SSR: fresh instance per call, scoped to the calling
 * `createSduiServices()` request.
 *
 * Updates are **additive** — new keys merge in, existing keys overwrite
 * only when the value differs, and missing keys are NOT cleared. Each
 * paginated response only ships the literals its templates need; later
 * pages are supplementary, not authoritative.
 */
export class LocalizedLiteralsStore extends UnkeyedStore<LocalizedLiteralsData> {
  override applyUpdate(update: EntityData | Record<string, EntityData>): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- defensive runtime guard against malformed payloads.
    if (!update || typeof update !== "object") return;
    batch(() => {
      let mutated = false;
      for (const [mapKey, value] of Object.entries(update)) {
        if (typeof value !== "string") continue;
        const fieldSignal = this.getOrCreateSignal(mapKey);
        if (!Object.is(fieldSignal.peek(), value)) {
          fieldSignal.value = value;
          mutated = true;
        }
      }
      if (mutated) this.bumpVersion();
    });
  }
}
