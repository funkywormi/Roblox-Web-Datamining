import { batch, signal, type ReadonlySignal, type Signal } from "@preact/signals-core";
import {
  DataStatus,
  type EntityData,
  type HydrationRead,
  type HydrationStore,
} from "../../../types";
import { snakeToCamel } from "../../../utils/caseConversion";
import { isRecord } from "../../../utils/typeGuards";
import { tryGetPathFromData } from "../../tryGetPathFromData";

export const CLIENT_PAGE_SCOPE_CONTENT_TYPE = "clientPageScope";

/**
 * Client-owned facts keyed by SDUI config key.
 *
 * Templates bind fields through `clientPageScope.<field>[.<nestedField>...]`.
 * The binder supplies the active config key as the entity id, matching
 * lua-apps' per-config-key client page scopes while preserving web's store
 * registry.
 */
interface ClientPageScopeState {
  readonly fieldSignals: Map<string, Signal<unknown>>;
  readonly version: Signal<number>;
}

export class ClientPageScopeStore implements HydrationStore {
  private static readonly instances = new WeakMap<object, unknown>();

  static getInstance<T extends ClientPageScopeStore>(this: new () => T): T {
    if (typeof window === "undefined") {
      return new this();
    }
    const cached = ClientPageScopeStore.instances.get(this);
    if (cached instanceof this) return cached;
    const instance = new this();
    ClientPageScopeStore.instances.set(this, instance);
    return instance;
  }

  /**
   * Test-only: drop the browser singleton so the next `getInstance()` call
   * constructs a fresh store.
   */
  static __resetForTesting(this: new () => ClientPageScopeStore): void {
    ClientPageScopeStore.instances.delete(this);
  }

  private readonly scopes = new Map<string, ClientPageScopeState>();

  private getOrCreateScope(id: string): ClientPageScopeState {
    let scope = this.scopes.get(id);
    if (!scope) {
      scope = {
        fieldSignals: new Map(),
        version: signal(0),
      };
      this.scopes.set(id, scope);
    }
    return scope;
  }

  private getOrCreateFieldSignal(id: string, field: string): Signal<unknown> {
    // Templates bind snake_case. Host writers store camelCase. Both spellings
    // share one signal, including a read that happens before the write.
    const canonicalField = snakeToCamel(field);
    const scope = this.getOrCreateScope(id);
    let fieldSignal = scope.fieldSignals.get(canonicalField);
    if (!fieldSignal) {
      fieldSignal = signal<unknown>(undefined);
      scope.fieldSignals.set(canonicalField, fieldSignal);
    }
    return fieldSignal;
  }

  private readEntity(id: string, reactive: boolean): EntityData {
    const scope = this.getOrCreateScope(id);
    if (reactive) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- subscribe whole-entity readers to writes in this scope.
      scope.version.value;
    }

    const entity: EntityData = {};
    for (const [field, fieldSignal] of scope.fieldSignals) {
      const value = fieldSignal.peek();
      if (value !== undefined) entity[field] = value;
    }
    return entity;
  }

  getField(id: string, path: string[]): HydrationRead {
    const field = path[0];
    if (field === undefined) return this.getEntity(id);

    const fieldValue = this.getOrCreateFieldSignal(id, field).value;
    const value = path.length === 1 ? fieldValue : tryGetPathFromData(fieldValue, path, 1);
    return { value, status: DataStatus.Ready };
  }

  getEntity(id: string): HydrationRead<EntityData> {
    return { value: this.readEntity(id, true), status: DataStatus.Ready };
  }

  get(id: string, field: string): unknown {
    return this.getOrCreateFieldSignal(id, field).peek();
  }

  set(id: string, field: string, value: unknown): void {
    const scope = this.getOrCreateScope(id);
    const fieldSignal = this.getOrCreateFieldSignal(id, field);
    if (Object.is(fieldSignal.peek(), value)) return;

    batch(() => {
      fieldSignal.value = value;
      scope.version.value = scope.version.peek() + 1;
    });
  }

  getSignal(id: string, field: string): ReadonlySignal<unknown> {
    return this.getOrCreateFieldSignal(id, field);
  }

  applyUpdate(update: EntityData | Record<string, EntityData>): void {
    batch(() => {
      for (const [id, entity] of Object.entries(update)) {
        if (!isRecord(entity)) continue;
        for (const [field, value] of Object.entries(entity)) {
          this.set(id, field, value);
        }
      }
    });
  }

  snapshot(): Map<string, EntityData> {
    const snapshot = new Map<string, EntityData>();
    for (const id of this.scopes.keys()) {
      const entity = this.readEntity(id, false);
      if (Object.keys(entity).length > 0) snapshot.set(id, entity);
    }
    return snapshot;
  }

  clear(): void {
    batch(() => {
      for (const scope of this.scopes.values()) {
        let mutated = false;
        for (const fieldSignal of scope.fieldSignals.values()) {
          if (fieldSignal.peek() !== undefined) {
            fieldSignal.value = undefined;
            mutated = true;
          }
        }
        if (mutated) scope.version.value = scope.version.peek() + 1;
      }
    });
  }
}

export interface SduiClientPageScope {
  get(field: string): unknown;
  set(field: string, value: unknown): void;
  getSignal(field: string): ReadonlySignal<unknown>;
}

export function getSduiClientPageScope(configKey: string): SduiClientPageScope {
  const store = ClientPageScopeStore.getInstance();
  return {
    get: field => store.get(configKey, field),
    set: (field, value) => {
      store.set(configKey, field, value);
    },
    getSignal: field => store.getSignal(configKey, field),
  };
}
