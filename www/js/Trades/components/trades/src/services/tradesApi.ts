import { escapeHtml, concat } from "@rbx/core-scripts/format/string";
import * as http from "@rbx/core-scripts/http";
import tradesConstants from "../constants/tradesConstants";
import {
  AcceptTradeResponse,
  ApiFieldError,
  CanTradeWithResponse,
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

/**
 * Regional-restriction / eligibility check used to decide whether the trade
 * list shows the regional-restrictions banner. Port of tradesService.canTrade.
 */
export const canTrade = async (): Promise<{ tradeEligibility?: string } | null> => {
  const urlConfig = {
    url: `${tradesConstants.urls.tradesApi}/v2/users/me/can-trade`,
    withCredentials: true,
  };
  const { data } = await http.get<{ tradeEligibility?: string }>(urlConfig);
  return data ?? null;
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

/** Extract API error codes from a rejected http promise. */
export const getErrorCodes = (error: unknown): number[] => {
  try {
    return http.getApiErrorCodes(error) || [];
  } catch {
    return [];
  }
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
