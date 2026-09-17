import { escapeHtml, concat } from "@rbx/core-scripts/format/string";
import * as http from "@rbx/core-scripts/http";
import tradesConstants from "../constants/tradesConstants";
import {
  AcceptTradeResponse,
  ApiFieldError,
  CanTradeResponse,
  CanTradeWithCurrencyResponse,
  CanTradeWithResponse,
  CurrencyTransferEligibility,
  InventoryPage,
  PagingParameters,
  SendTradeRequest,
  SendTradeResponse,
  TradableItem,
  TradeDetail,
  TradeUser,
  TradesPage,
  TradeSummary,
  UserSettings,
} from "../types";
import { isSpentFreeTradesAllowance } from "../utils/tradesUtils";

export const buildNameForDisplay = (displayName?: string | null, name?: string | null): string =>
  concat([escapeHtml(displayName ?? ""), escapeHtml(name ?? "")], undefined, true);

/**
 * Fetch a page of trades for the given status tab. Mirrors
 * tradesService.getTrades but returns a promise that resolves with the parsed
 * page instead of using Angular's $q.
 */
export const getTrades = async (pagingParameters: PagingParameters): Promise<TradesPage> => {
  const urlConfig = {
    url: `${tradesConstants.urls.tradesApi}/v1/trades/${pagingParameters.tradeStatusType}`,
    withCredentials: true,
  };
  const params = {
    cursor: pagingParameters.cursor,
    limit: pagingParameters.count,
    sortOrder: "Desc",
  };

  const { data } = await http.get<{
    nextPageCursor: string | null;
    data: TradeSummary[];
  }>(urlConfig, params);

  const items = (data.data || []).map(trade => ({
    ...trade,
    tradeStatusType: pagingParameters.tradeStatusType,
    user: trade.user ? { ...trade.user, nameForDisplay: trade.user.displayName } : trade.user,
  }));

  return { nextPageCursor: data.nextPageCursor, items };
};

/**
 * Fetch full detail for a single trade and normalize offers + partner user,
 * matching tradesService.getTrade.
 */
export const getTrade = async (userId: number, tradeId: number): Promise<TradeDetail | null> => {
  const urlConfig = {
    url: `${tradesConstants.urls.tradesApi}/v2/trades/${tradeId}`,
    withCredentials: true,
  };
  const { data } = await http.get<TradeDetail>(urlConfig);

  if (!data) {
    return null;
  }

  // A participant's `user` can be null when that account is deleted/moderated,
  // so guard the id comparisons (optional chaining) to avoid dereferencing null.
  if (data.participantAOffer.user?.id === userId) {
    data.user = data.participantBOffer.user;
  } else if (data.participantBOffer.user?.id === userId) {
    data.user = data.participantAOffer.user;
  }

  if (data.user) {
    data.user.nameForDisplay = buildNameForDisplay(data.user.displayName, data.user.name);
  }

  data.offers = [data.participantAOffer, data.participantBOffer];
  return data;
};

export const acceptTrade = async (tradeId: number): Promise<AcceptTradeResponse> => {
  const urlConfig = {
    url: `${tradesConstants.urls.tradesApi}/v1/trades/${tradeId}/accept`,
    withCredentials: true,
  };
  const { data } = await http.post<AcceptTradeResponse>(urlConfig);
  return data ?? {};
};

export const declineTrade = async (tradeId: number): Promise<void> => {
  const urlConfig = {
    url: `${tradesConstants.urls.tradesApi}/v1/trades/${tradeId}/decline`,
    withCredentials: true,
  };
  await http.post(urlConfig);
};

export const expireOutdatedTrades = async (): Promise<void> => {
  const urlConfig = {
    url: `${tradesConstants.urls.tradesApi}/v1/trades/expire-outdated`,
    withCredentials: true,
  };
  await http.post(urlConfig);
};

export const getSettings = async (): Promise<UserSettings> => {
  const urlConfig = { url: tradesConstants.urls.getSettings, withCredentials: true };
  const { data } = await http.get<UserSettings>(urlConfig);
  return data;
};

export const setTradeQuality = async (quality: string): Promise<void> => {
  const urlConfig = { url: tradesConstants.urls.setTradeQuality, withCredentials: true };
  await http.post(urlConfig, { tradeQualityFilter: quality });
};

let canTradeRequest: Promise<CanTradeResponse | null> | null = null;
/** Latest successful can-trade payload, or `null` if the request returned empty. */
let lastCanTradeResponse: CanTradeResponse | null | undefined;

type CanTradeListener = (response: CanTradeResponse | null) => void;
const canTradeListeners = new Set<CanTradeListener>();

/**
 * Subscribe to successful `/v2/users/me/can-trade` responses. Used so every
 * quota hook updates after a refresh without each one polling.
 */
export const subscribeCanTrade = (listener: CanTradeListener): (() => void) => {
  canTradeListeners.add(listener);
  return () => {
    canTradeListeners.delete(listener);
  };
};

const publishCanTrade = (response: CanTradeResponse | null) => {
  lastCanTradeResponse = response;
  canTradeListeners.forEach(listener => {
    listener(response);
  });
};

/** Last can-trade response, for analytics that need the free-trade cap. */
export const getCachedCanTrade = (): CanTradeResponse | null | undefined => lastCanTradeResponse;

/**
 * Trade eligibility plus the monthly free-trade allowance. Port of
 * tradesService.canTrade.
 *
 * The regional-restrictions banner and the Plus upsell both read this and mount
 * together, so the in-flight request is shared instead of being issued twice.
 * Failures are not cached, leaving a later caller free to retry.
 */
export const canTrade = ({ refresh = false } = {}): Promise<CanTradeResponse | null> => {
  if (refresh) {
    canTradeRequest = null;
  }

  canTradeRequest ??= http
    .get<CanTradeResponse>({
      url: `${tradesConstants.urls.tradesApi}/v2/users/me/can-trade`,
      withCredentials: true,
    })
    .then(({ data }) => {
      const response = data ?? null;
      publishCanTrade(response);
      return response;
    })
    .catch((error: unknown) => {
      canTradeRequest = null;
      throw error;
    });

  return canTradeRequest;
};

/** Drop the cached can-trade response and fetch again, updating subscribers. */
export const refreshCanTrade = (): void => {
  canTrade({ refresh: true }).catch(() => undefined);
};

/**
 * Lightweight check (single page) of whether the user owns any tradable
 * (limited) items. Used only for the first-visit analytics dimension. Port of
 * tradesService.hasTradableItems.
 */
export const hasTradableItems = async (userId: number): Promise<boolean> => {
  if (!userId || userId <= 0) {
    return false;
  }

  const urlConfig = {
    url: `${tradesConstants.urls.tradesApi}/v2/users/${userId}/tradableItems`,
    withCredentials: true,
  };
  const params = { limit: 10, sortBy: "CreationTime", sortOrder: "Desc" };

  try {
    const { data } = await http.get<{ items?: unknown[] }>(urlConfig, params);
    return Array.isArray(data?.items) && data.items.length > 0;
  } catch {
    return false;
  }
};

/** Look up a trade partner by id. Port of tradesService.getUserById. */
export const getUserById = async (userId: number): Promise<TradeUser> => {
  if (!userId || userId <= 0) {
    throw new Error("Invalid user id");
  }
  const urlConfig = { url: `${tradesConstants.urls.usersApi}/v1/users`, withCredentials: true };
  const { data } = await http.post<{
    data: { id: number; name: string; displayName: string }[];
  }>(urlConfig, { userIds: [userId] });

  const user = data?.data?.[0];
  if (!user) {
    throw new Error("User not found");
  }
  return {
    id: user.id,
    name: user.name,
    displayName: user.displayName,
    nameForDisplay: buildNameForDisplay(user.displayName, user.name),
  };
};

/** Whether the authenticated user is allowed to trade with the given partner. */
export const canTradeWith = async (userId: number): Promise<CanTradeWithResponse | null> => {
  const urlConfig = {
    url: `${tradesConstants.urls.tradesApi}/v1/users/${userId}/can-trade-with`,
    withCredentials: true,
  };
  const { data } = await http.get<CanTradeWithResponse>(urlConfig);
  return data ?? null;
};

/**
 * Robux permissions for this pairing, which only v2 reports. Kept separate
 * from `canTradeWith` because v2 drops the `status` the builder's eligibility
 * gate reads, so each version is called for the half it answers.
 */
export const getCurrencyTransferEligibility = async (
  userId: number,
): Promise<CurrencyTransferEligibility | null> => {
  const urlConfig = {
    url: `${tradesConstants.urls.tradesApi}/v2/users/${userId}/can-trade-with`,
    withCredentials: true,
  };
  const { data } = await http.get<CanTradeWithCurrencyResponse>(urlConfig);
  return data?.currencyTransferEligibility ?? null;
};

const normalizeInstance = (instance: TradableItem, userId: number): TradableItem => ({
  ...instance,
  id: instance.collectibleItemInstanceId,
  userId,
});

export type InventoryPageOptions = {
  itemTargetType?: string;
  cursor?: string;
  limit?: number;
  /** Free-text item-name query. */
  search?: string;
};

/**
 * Fetch a page of a user's tradable items. Port of the pager wired up in
 * inventoryController (flattens `items[].instances`).
 */
export const getInventoryPage = async (
  userId: number,
  {
    itemTargetType,
    cursor,
    limit = tradesConstants.getTradableItemsLimit,
    search,
  }: InventoryPageOptions = {},
): Promise<InventoryPage> => {
  const urlConfig = {
    url: `${tradesConstants.urls.tradesApi}/v2/users/${userId}/tradableItems`,
    withCredentials: true,
  };
  const params: Record<string, unknown> = { sortBy: "CreationTime", sortOrder: "Desc", limit };
  if (cursor) {
    params.cursor = cursor;
  }
  if (itemTargetType) {
    params.itemTargetTypes = itemTargetType;
  }
  if (search) {
    params.search = search;
  }

  const { data } = await http.get<{
    items?: { instances?: TradableItem[] }[];
    nextPageCursor: string | null;
  }>(urlConfig, params);

  const items = (data.items || [])
    .reduce<TradableItem[]>((acc, item) => [...acc, ...(item.instances || [])], [])
    .map(instance => normalizeInstance(instance, userId));

  return { items, nextPageCursor: data.nextPageCursor ?? null };
};

/**
 * Recursively fetch every tradable item a user owns. Port of
 * tradesService.getAllInventoryByUserId (used for `?oitems`/`?ritems` prefill).
 */
export const getAllInventoryByUserId = async (userId: number): Promise<TradableItem[]> => {
  if (!userId || userId <= 0) {
    return [];
  }
  const all: TradableItem[] = [];
  let cursor: string | undefined;
  try {
    do {
      // eslint-disable-next-line no-await-in-loop
      const page = await getInventoryPage(userId, { cursor });
      all.push(...page.items);
      cursor = page.nextPageCursor || undefined;
    } while (cursor);
  } catch {
    return all;
  }
  return all;
};

export const sendTrade = async (body: SendTradeRequest): Promise<SendTradeResponse> => {
  const urlConfig = {
    url: `${tradesConstants.urls.tradesApi}/v2/trades/send`,
    withCredentials: true,
  };
  const { data } = await http.post<SendTradeResponse>(urlConfig, body);
  return data ?? {};
};

export const counterTrade = async (
  tradeId: number,
  body: SendTradeRequest,
): Promise<SendTradeResponse> => {
  const urlConfig = {
    url: `${tradesConstants.urls.tradesApi}/v2/trades/${tradeId}/counter`,
    withCredentials: true,
  };
  const { data } = await http.post<SendTradeResponse>(urlConfig, body);
  return data ?? {};
};

/**
 * Extract API error codes from a rejected http promise.
 *
 * The core-scripts interceptor rejects with the Axios *response* rather than
 * the error, so the payload sits under `data` — and `getApiErrorCodes` only
 * reads a top-level `errors`. Each wrapper is tried so the codes are found
 * whichever shape the rejection arrives in.
 */
export const getErrorCodes = (error: unknown): number[] => {
  const read = (value: unknown): number[] => {
    try {
      return http.getApiErrorCodes(value) || [];
    } catch {
      return [];
    }
  };

  const err = error as Record<string, unknown> | undefined;
  const response = err?.response as Record<string, unknown> | undefined;

  for (const candidate of [err, err?.data, response?.data]) {
    const codes = read(candidate);
    if (codes.length > 0) {
      return codes;
    }
  }

  return [];
};

const normalizeEligibility = (value: unknown): string | null =>
  typeof value === "string" ? value.replace(/[^a-z]/gi, "").toLowerCase() : null;

/**
 * Matches the age-check trade eligibility (`IneligibleAgeCheckRequired`),
 * tolerating whether the API spells out the `Ineligible` prefix.
 */
export const isAgeCheckEligibility = (value: unknown): boolean =>
  (normalizeEligibility(value) ?? "").endsWith("agecheckrequired");

/**
 * Matches a spent free-trade allowance (`IneligibleFreeTradesLimitReached`),
 * including a `Sender…` spelling if can-trade-with reports the same stem.
 */
export const isFreeTradesLimitEligibility = (value: unknown): boolean =>
  (normalizeEligibility(value) ?? "").endsWith("freetradeslimitreached");

const isAgeCheckReason = (value: unknown): boolean => {
  if (value === 7) {
    return true;
  }
  if (typeof value !== "string") {
    return false;
  }
  const normalized = value.replace(/[^a-z]/gi, "").toLowerCase();
  return normalized === "reasonsenderagecheckrequired" || normalized === "senderagecheckrequired";
};

/**
 * Detects SendTradeError.UsersCannotTrade.REASON_SENDER_AGE_CHECK_REQUIRED.
 * The gateway may expose protobuf details directly or under an HTTP error
 * response, so walk the rejected value without relying on one wrapper shape.
 */
export const isAgeCheckRequiredError = (error: unknown): boolean => {
  const visited = new WeakSet<object>();

  const visit = (value: unknown): boolean => {
    if (!value || typeof value !== "object" || visited.has(value)) {
      return false;
    }
    visited.add(value);

    return Object.entries(value).some(([key, nestedValue]) => {
      const normalizedKey = key.replace(/[^a-z]/gi, "").toLowerCase();
      if (
        normalizedKey === "senderagecheckrequired" ||
        (normalizedKey === "reason" && isAgeCheckReason(nestedValue))
      ) {
        return true;
      }
      return visit(nestedValue);
    });
  };

  return visit(error);
};

/**
 * Extract the first structured API error (code + field + fieldData) from a
 * rejected http promise, digging through the shapes Axios may expose.
 * Needed for the richer send-trade error messages (privacy side, min value, etc).
 */
export const getApiError = (error: unknown): ApiFieldError | null => {
  const readErrors = (obj: unknown): ApiFieldError[] | null => {
    if (!obj || typeof obj !== "object") {
      return null;
    }
    const { errors } = obj as Record<string, unknown>;
    return Array.isArray(errors) ? (errors as ApiFieldError[]) : null;
  };

  const err = error as Record<string, unknown> | undefined;
  const response = err?.response as Record<string, unknown> | undefined;
  const errors = readErrors(err) || readErrors(err?.data) || readErrors(response?.data);
  return errors && errors.length > 0 ? errors[0]! : null;
};

/**
 * Whether a failed send/counter/accept was blocked because the viewer still
 * needs an age check.
 *
 * The REST layer collapses `UsersCannotTrade` into the legacy
 * `userCannotTrade` code and drops the underlying reason, so the age-check case
 * is indistinguishable from the other reasons (privacy, blocks) on the error
 * alone. `can-trade` reports the viewer's own eligibility, which is exactly the
 * side an age check would unblock, so it settles the ambiguity. It is fetched
 * fresh because a cached response predates the failure.
 */
export const requiresAgeCheck = async (error: unknown): Promise<boolean> => {
  if (isAgeCheckRequiredError(error)) {
    return true;
  }

  const code = getApiError(error)?.code ?? getErrorCodes(error)[0];
  if (code !== tradesConstants.tradeErrors.userCannotTrade) {
    return false;
  }

  try {
    const response = await canTrade({ refresh: true });
    return isAgeCheckEligibility(response?.tradeEligibility);
  } catch {
    // Without eligibility we cannot tell the age-check case apart, so leave the
    // caller on its generic "cannot trade" message rather than opening a flow
    // that may not apply.
    return false;
  }
};

export type CannotTradeAction = "ageCheck" | "upsell" | "cannotTrade";

/**
 * What to do with a `userCannotTrade` (error 7) rejection.
 *
 * That code is shared by the age-check block and a spent free-trade allowance,
 * so eligibility and the allowance are read (fresh, via `requiresAgeCheck`)
 * before choosing the age-check prelude, the Plus pitch, or the generic
 * warning.
 */
export const resolveCannotTradeAction = async (error: unknown): Promise<CannotTradeAction> => {
  if (await requiresAgeCheck(error)) {
    return "ageCheck";
  }

  const code = getApiError(error)?.code ?? getErrorCodes(error)[0];
  if (code !== tradesConstants.tradeErrors.userCannotTrade) {
    return "cannotTrade";
  }

  try {
    const response = await canTrade();
    if (
      isFreeTradesLimitEligibility(response?.tradeEligibility) ||
      isSpentFreeTradesAllowance(response?.freeTradesAllowance)
    ) {
      return "upsell";
    }
  } catch {
    // Fall through to the generic warning when the allowance cannot be read.
  }

  return "cannotTrade";
};
