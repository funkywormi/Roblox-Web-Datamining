import { createSduiPoolStore, type SduiPoolStore } from "../pooling";
import type { SduiErrorReporter, SduiPageContext } from "../types";

export interface SduiPoolRegistry {
  getOrCreate(configKey: string): SduiPoolStore;
  delete(configKey: string): void;
  clear(): void;
}

export interface CreateSduiPoolRegistryOptions {
  errorReporter: SduiErrorReporter;
  pageContext: SduiPageContext;
  fallbackLayout: {
    screenWidth: number | undefined;
  };
}

export function createSduiPoolRegistry(options: CreateSduiPoolRegistryOptions): SduiPoolRegistry {
  const stores = new Map<string, SduiPoolStore>();

  function createStore(configKey: string): SduiPoolStore {
    const store = createSduiPoolStore({
      errorReporter: options.errorReporter,
      pageContext: options.pageContext,
      configKey,
      fallbackLayout: options.fallbackLayout,
    });

    return store;
  }

  return {
    getOrCreate(configKey) {
      const existingStore = stores.get(configKey);
      if (existingStore) return existingStore;

      const store = createStore(configKey);
      stores.set(configKey, store);
      return store;
    },
    delete(configKey) {
      const store = stores.get(configKey);
      if (!store) return;

      stores.delete(configKey);
      store.clear();
    },
    clear() {
      const removedStores = [...stores.values()];
      stores.clear();
      for (const store of removedStores) {
        store.clear();
      }
    },
  };
}
