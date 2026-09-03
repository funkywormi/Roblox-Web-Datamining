import { Account, IPFamily } from '@rbx/clients/rightsV1';
import { HydratedAgreementWithHydratedTargetsResponse } from '@rbx/clients/contentLicensingApi/v1';
import rightsClient from './rightsClient';
import contentLicensingClient from './contentLicensingClient';

// We add custom caching here to avoid making too many requests to the rights service. Each
// licensed transaction requires 4 requests to the rights service and most licensed transactions
// use the same small set of licenses, so we cache the results to avoid making the same requests
// multiple times.
class CacheManager<T> {
  private cache: Map<string, { data: T; timestamp: number }>;

  private pendingRequests: Map<string, Promise<T>>;

  private readonly ttl: number;

  constructor(ttlMs: number = 5 * 60 * 1000) {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.ttl = ttlMs;
  }

  get(key: string): T | null {
    const cachedData = this.cache.get(key);
    if (!cachedData) {
      return null;
    }

    if (Date.now() - cachedData.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cachedData.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  getPendingRequest(key: string): Promise<T> | undefined {
    return this.pendingRequests.get(key);
  }

  setPendingRequest(key: string, promise: Promise<T>): void {
    this.pendingRequests.set(key, promise);
  }

  clearPendingRequest(key: string): void {
    this.pendingRequests.delete(key);
  }
}

// Cache instances
const agreementCache = new CacheManager<HydratedAgreementWithHydratedTargetsResponse>();
const currentAccountCache = new CacheManager<Account>();
const ipFamilyCache = new CacheManager<IPFamily>();

// Cache key for current account
const CURRENT_ACCOUNT_CACHE_KEY = 'current';

function fetchWithCache<T>(
  cache: CacheManager<T>,
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  if (cached) {
    return Promise.resolve(cached);
  }

  const pending = cache.getPendingRequest(key);
  if (pending !== undefined) {
    return pending;
  }

  const request = fetchFn()
    .then(result => {
      cache.set(key, result);
      return result;
    })
    .finally(() => {
      cache.clearPendingRequest(key);
    });

  cache.setPendingRequest(key, request);
  return request;
}

function makeAccountAndIdCacheKey(accountId: string, id: string): string {
  return `${accountId}:${id}`;
}

/**
 * Get a hydrated agreement from content-licensing-api.
 * The response includes license and listing data inline, so separate calls
 * to getIpListingById are no longer needed.
 */
function getAgreementInfo(
  accountId: string,
  agreementId: string
): Promise<HydratedAgreementWithHydratedTargetsResponse> {
  return fetchWithCache(agreementCache, makeAccountAndIdCacheKey(accountId, agreementId), () =>
    contentLicensingClient.getAgreement(accountId, agreementId)
  );
}

function getCurrentAccount(): Promise<Account> {
  return fetchWithCache(currentAccountCache, CURRENT_ACCOUNT_CACHE_KEY, async () => {
    const accountAndUser = await rightsClient.getCurrentAccount();
    return accountAndUser.account;
  });
}

function getIpFamilyById(accountId: string, ipFamilyId: string): Promise<IPFamily> {
  return fetchWithCache(ipFamilyCache, makeAccountAndIdCacheKey(accountId, ipFamilyId), () =>
    rightsClient.getIpFamilyById(accountId, ipFamilyId)
  );
}

// Cache clearing functions
function clearAgreementCache(accountId: string, agreementId: string): void {
  agreementCache.clear(makeAccountAndIdCacheKey(accountId, agreementId));
}

function clearAllAgreementCache(): void {
  agreementCache.clear();
}

function clearCurrentAccountCache(): void {
  currentAccountCache.clear();
}

function clearIpFamilyCache(accountId: string, ipFamilyId: string): void {
  ipFamilyCache.clear(makeAccountAndIdCacheKey(accountId, ipFamilyId));
}

function clearAllIpFamilyCache(): void {
  ipFamilyCache.clear();
}

export {
  getAgreementInfo,
  getCurrentAccount,
  getIpFamilyById,
  clearAgreementCache,
  clearAllAgreementCache,
  clearCurrentAccountCache,
  clearIpFamilyCache,
  clearAllIpFamilyCache
};
