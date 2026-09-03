import { formatNumber } from "@rbx/core-scripts/format/number";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import Intl from "@rbx/core-scripts/intl";
import tradesConstants from "../constants/tradesConstants";
import { DraftOffer, TradableItem, TradeOffer } from "../types";

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

export const isMobile = (): boolean => Boolean(getDeviceMeta()?.isPhone);

export const localizeDate = (date: string): string =>
  new Intl().getDateTimeFormatter().getShortDate(new Date(date));
