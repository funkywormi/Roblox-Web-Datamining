import type { PeriodType as SubscriptionPeriodType } from "@rbx/subscriptions-common";

import type { Money, PeriodType } from "../types/buyRobuxPageData";

export const SECTION_PRODUCT_TYPE_TO_API: Record<string, string> = {
  PRODUCT_TYPE_ROBLOX_PLUS: "Blackbird",
};

export function parseRobuxAllowance(robuxAmount: string | undefined): number {
  if (robuxAmount == null) {
    return 0;
  }
  // Protobuf int64 arrives as string; a malformed value falls back to 0.
  const parsed = Number.parseInt(robuxAmount, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function parseMoneyUnits(value: number | string | undefined): number {
  if (value == null) {
    return 0;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function getMoneyAmount(money: Money): number {
  return parseMoneyUnits(money.units) + (money.nanos ?? 0) * 1e-9;
}

export function convertPeriodTypeForTranslation(periodType: PeriodType): SubscriptionPeriodType {
  switch (periodType) {
    case "PERIOD_TYPE_WEEK":
      return "Week";
    case "PERIOD_TYPE_MONTH":
      return "Month";
    case "PERIOD_TYPE_YEAR":
      return "Year";
  }
}

export function isPeriodType(value: string): value is PeriodType {
  return (
    value === "PERIOD_TYPE_WEEK" || value === "PERIOD_TYPE_MONTH" || value === "PERIOD_TYPE_YEAR"
  );
}
