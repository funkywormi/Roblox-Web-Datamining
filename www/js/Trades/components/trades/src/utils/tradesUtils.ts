import { formatNumber } from "@rbx/core-scripts/format/number";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import Intl from "@rbx/core-scripts/intl";
import tradesConstants from "../constants/tradesConstants";
import { DraftOffer, FreeTradesAllowance, TradableItem, TradeOffer } from "../types";

type TranslateFn = (key: string, params?: Record<string, unknown>) => string;

// TypeScript port of the value/fee math in
// js/angular/trades/services/tradesUtilityService.js.

const MARKETPLACE_FEE = 0.3;

const bankersRound = (n: number): number => {
  const x = n;
  const r = Math.round(x);
  if (Math.abs(x) % 1 !== 0.5) {
    return r;
  }
  return r % 2 === 0 ? r : r - 1;
};

export const isInRange = (value: number): boolean => {
  const number = parseInt(String(value), 10);
  return number >= tradesConstants.minRobux && number <= tradesConstants.maxRobux;
};

export const isInteger = (value: number): boolean => Number.isInteger(parseInt(String(value), 10));

export const getFeeAsPercent = (): number => MARKETPLACE_FEE * 100;

export const calculateRobuxMinusFee = (robux: number): number => {
  if (!isInRange(robux)) {
    return 0;
  }
  return bankersRound(robux * (1 - MARKETPLACE_FEE));
};

export const calculateOfferValue = (offer: TradeOffer | DraftOffer): number => {
  let value = offer.items.reduce(
    (total, item) => total + (item.recentAveragePrice ? item.recentAveragePrice : 0),
    0,
  );

  const robux = offer.robux ?? 0;
  if (isInteger(robux) && isInRange(robux)) {
    value += parseInt(String(robux), 10);
  }

  return value;
};

/**
 * Whether a Robux amount is empty (valid) or a valid integer in range. Port of
 * tradeRequestController.isRobuxAmountValid.
 */
export const isRobuxAmountValid = (robux: number | null | undefined | string): boolean => {
  if (typeof robux === "undefined" || robux === null || robux === "") {
    return true;
  }
  return isInteger(robux as number) && isInRange(robux as number);
};

/** Serial-number tooltip text for a tradable item. Port of renderSerialNumber. */
export const renderSerialNumber = (item: TradableItem, translate: TranslateFn): string => {
  if (!item.serialNumber) {
    return translate("Label.NoSerialNumber");
  }
  return translate("Label.SerialNumber", {
    serialNumber: formatNumber(item.serialNumber),
    totalNumber: formatNumber(item.assetStock ?? 0),
  });
};

/**
 * Hover-tooltip text for the limited/serial badge. On hover the badge hides its
 * inline text and shows everything here instead: serialized items read
 * `#1234/45678` (serial/total) and non-serialized limiteds read
 * `Serial N/A /45678` (no-serial label + total).
 */
export const renderSerialTooltip = (item: TradableItem, translate: TranslateFn): string => {
  const total = item.assetStock ? formatNumber(item.assetStock) : "";
  if (item.serialNumber != null) {
    const serial = formatNumber(item.serialNumber);
    return total ? `#${serial}/${total}` : `#${serial}`;
  }
  const noSerial = translate("Label.NoSerialNumber");
  return total ? `${noSerial} /${total}` : noSerial;
};

/**
 * Whether the free-trade allowance actually caps the viewer, i.e. free trades
 * are unlocked for them.
 *
 * A negative `remaining` is the endpoint's sentinel for an allowance that does
 * not apply rather than one that is spent, so `{ limit: 2, remaining: -1 }`
 * means uncapped. An absent allowance means the same (a member, say).
 */
export const isCappedByFreeTrades = (allowance: FreeTradesAllowance | null | undefined): boolean =>
  allowance != null && allowance.limit > 0 && allowance.remaining >= 0;

/**
 * Whether the viewer has used every free trade in the current window.
 *
 * Distinct from "uncapped": a negative remaining is a sentinel that no
 * allowance applies, so that is not spent. Callers that hide this from Plus
 * members still need to AND with membership themselves.
 */
export const isSpentFreeTradesAllowance = (
  allowance: FreeTradesAllowance | null | undefined,
): boolean => isCappedByFreeTrades(allowance) && (allowance?.remaining ?? 0) <= 0;

/**
 * Whether a free-trade allowance resets monthly, which decides whether the
 * counter can be worded as "this month".
 *
 * The window is matched loosely because the API has spelled it several ways
 * (`Month`, `MONTH`, the raw `FREE_TRADES_WINDOW_MONTH` enum name), and an
 * unrecognized value silently downgrades the copy to the generic counter.
 */
export const isMonthlyWindow = (window: string): boolean =>
  window
    .replace(/[^a-z]/gi, "")
    .toLowerCase()
    .includes(tradesConstants.freeTradesWindow.month.toLowerCase());

export const isMobile = (): boolean => Boolean(getDeviceMeta()?.isPhone);

export const localizeDate = (date: string): string =>
  new Intl().getDateTimeFormatter().getShortDate(new Date(date));

/** Abbreviated month and day, e.g. `Dec 31`. */
export const formatShortMonthDate = (date: string): string =>
  new Intl()
    .getDateTimeFormatter()
    .getCustomDateTime(new Date(date), { month: "short", day: "numeric" });
