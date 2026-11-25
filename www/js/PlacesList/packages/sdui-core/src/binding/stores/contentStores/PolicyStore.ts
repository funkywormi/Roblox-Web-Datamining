import { batch, signal } from "@preact/signals-core";
import { NOT_READY_READ, type EntityData, type HydrationRead } from "../../../types";
import { snakeToCamel } from "../../../utils/caseConversion";
import { isRecord } from "../../../utils/typeGuards";
import { UnkeyedStore } from "../UnkeyedStore";

/** Content-type key under which Guac `app-policy` values are registered on the data binder. */
export const POLICY_CONTENT_TYPE = "policy";

export type PolicyData = Record<string, unknown>;

function toCamelKeys(data: EntityData): PolicyData {
  const result: PolicyData = {};
  for (const [fieldName, value] of Object.entries(data)) {
    result[snakeToCamel(fieldName)] = value;
  }
  return result;
}

/**
 * Guac `app-policy` values for template bindings, e.g. `policy.<field>`.
 * Access via `PolicyStore.getInstance()`. Mirrors lua-apps'
 * `getSduiPolicyStore().setAppPolicy`.
 *
 * Starts unloaded. Browser services register a loader with `setLoader`
 * (see `loadAppPolicy`), and the first read of an unloaded store starts it, so
 * pages that never bind `policy.*` never fetch. Until the policy arrives every
 * read is `NotReady`, so no branch of a policy-gated condition renders, negated
 * or not. Once loaded, a missing field reads `undefined`.
 *
 * Keys are stored camelCase (Guac's casing). Templates may bind snake_case;
 * both spellings share one signal, including a read before the policy loads
 * (same as `ClientPageScopeStore`).
 *
 * The policy is tab-scoped, not page-scoped: `clear()` re-applies the last
 * loaded policy instead of dropping it.
 *
 * Browser: lazy process singleton shared across services bundles for the tab.
 * SSR: fresh instance per call, scoped to the calling `createSduiServices()`
 * request and never loaded (no loader is registered server-side).
 */
export class PolicyStore extends UnkeyedStore<PolicyData> {
  private readonly loaded = signal(false);

  private lastPolicy: PolicyData | undefined;

  private loader: (() => void) | undefined;

  private loadStarted = false;

  /**
   * Register how to fetch the policy. The first loader wins, since the browser
   * store is shared by every services instance in the tab. It runs once, on the
   * first read before the policy loads.
   */
  setLoader(loader: () => void): void {
    this.loader ??= loader;
  }

  private startLoad(): void {
    const { loader } = this;
    if (this.loadStarted || !loader) return;
    this.loadStarted = true;
    // Reads happen inside reactive computations; start the fetch outside them.
    queueMicrotask(loader);
  }

  /** Replace the stored policy and mark it loaded. Non-object payloads are treated as an empty policy. */
  setPolicy(data: unknown): void {
    const policy = isRecord(data) ? toCamelKeys(data) : {};
    this.lastPolicy = policy;
    batch(() => {
      super.applyUpdate(policy);
      this.loaded.value = true;
    });
  }

  override getField(id: string, path: string[]): HydrationRead {
    if (!this.loaded.value) {
      this.startLoad();
      return NOT_READY_READ;
    }
    const [head, ...rest] = path;
    return super.getField(id, head === undefined ? path : [snakeToCamel(head), ...rest]);
  }

  override getEntity(id: string): HydrationRead<PolicyData> {
    if (!this.loaded.value) {
      this.startLoad();
      return NOT_READY_READ;
    }
    return super.getEntity(id);
  }

  override applyUpdate(update: EntityData | Record<string, EntityData>): void {
    this.setPolicy(update);
  }

  override clear(): void {
    if (this.lastPolicy) super.applyUpdate(this.lastPolicy);
  }
}
