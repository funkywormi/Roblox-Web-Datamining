import localStorageService from "../../local-storage";
import {
  DefaultExpirationWindowMS,
  CacheProperties,
  CacheStorePrefix,
} from "./batchRequestConstants";

export default class CacheStore {
  private readonly store = new Map<string, unknown>();

  private readonly useCache: boolean;

  private readonly expirationWindowMS: number;

  private readonly storeKeyPrefix: string;

  constructor(useCache?: boolean, expirationWindowMS?: number) {
    this.useCache = useCache ?? false;
    this.expirationWindowMS = expirationWindowMS ?? DefaultExpirationWindowMS;
    this.storeKeyPrefix = `${CacheStorePrefix}:`;
  }

  private getCacheKey(key: string) {
    return `${this.storeKeyPrefix}${key}`;
  }

  public has(key: string, cacheProperties?: CacheProperties): boolean {
    const storeKey = this.getCacheKey(key);
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if ((cacheProperties?.useCache ?? this.useCache) && localStorage) {
      return Boolean(
        localStorageService.fetchNonExpiredCachedData(
          storeKey,
          cacheProperties?.expirationWindowMS ?? this.expirationWindowMS,
        ),
      );
    }
    return this.store.has(storeKey);
  }

  public set(key: string, data: unknown, cacheProperties?: CacheProperties): void {
    const storeKey = this.getCacheKey(key);
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if ((cacheProperties?.useCache ?? this.useCache) && localStorage) {
      localStorageService.saveDataByTimeStamp(
        storeKey,
        data,
        cacheProperties?.expirationWindowMS ?? this.expirationWindowMS,
      );
    }
    this.store.set(storeKey, data);
  }

  public get(key: string, { useCache, expirationWindowMS }: CacheProperties): unknown {
    const storeKey = this.getCacheKey(key);
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if ((useCache || this.useCache) && localStorage) {
      return localStorageService.fetchNonExpiredCachedData(
        storeKey,
        expirationWindowMS ?? this.expirationWindowMS,
        // @ts-expect-error TODO: old, migrated code
      )?.data;
    }
    return this.store.get(storeKey);
  }

  public delete(key: string): void {
    const storeKey = this.getCacheKey(key);
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (localStorage) {
      localStorageService.removeLocalStorage(storeKey);
    }
    this.store.delete(storeKey);
  }

  // clear everything in store
  // and localstorage
  public clear(): void {
    this.store.clear();
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (localStorage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        // `i < localStorage.length`
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const localStorageKey = localStorage.key(i)!;
        if (localStorageKey.includes(this.storeKeyPrefix)) {
          keysToRemove.push(localStorageKey);
        }
      }
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
    }
  }
}
