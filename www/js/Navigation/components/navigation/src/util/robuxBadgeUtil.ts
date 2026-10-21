import { ValueOf } from "@rbx/core-types";
import { getItem, setItem } from "@rbx/core-lib/local-storage";
import "../constants/localStorageRegistry";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import RobuxBadgeType from "../constants/robuxBadgeConstants";

export const mapRobuxBadgeTypeToLocalStorageKey = (
  robuxBadgeType: string,
):
  | `prevLocalVirtualItemStartTimeSeconds${string}`
  | "hasSeenRobuxUpdate"
  | "hasSeenRobuxBonusRobux2026_10"
  | "" => {
  switch (robuxBadgeType) {
    case RobuxBadgeType.VIRTUAL_ITEM:
      return `prevLocalVirtualItemStartTimeSeconds${authenticatedUser()?.id ?? ""}`;
    case RobuxBadgeType.UPDATE:
      return "hasSeenRobuxUpdate";
    case RobuxBadgeType.BONUS_ROBUX_2026_10:
      return "hasSeenRobuxBonusRobux2026_10";
    default:
      return "";
  }
};

export const mapRobuxBadgeTypeToStr = (robuxBadgeType: string): string => {
  switch (robuxBadgeType) {
    case RobuxBadgeType.VIRTUAL_ITEM:
      return "Labels.NewItem";
    case RobuxBadgeType.UPDATE:
      return "Labels.NewUpdate";
    case RobuxBadgeType.BONUS_ROBUX_2026_10:
      return "Labels.LimitedTimeBonus";
    default:
      return "";
  }
};

export const setRobuxBadgeLocalStorage = (robuxBadgeType: string): void => {
  switch (robuxBadgeType) {
    case RobuxBadgeType.VIRTUAL_ITEM:
      // Set local storage to hide robux badge for current virtual item when badge is acknowledged.
      setItem(
        `prevLocalVirtualItemStartTimeSeconds${authenticatedUser()?.id ?? ""}`,
        Math.floor(Date.now() / 1000),
      );
      break;
    case RobuxBadgeType.UPDATE:
      setItem("hasSeenRobuxUpdate", "true");
      break;
    case RobuxBadgeType.BONUS_ROBUX_2026_10:
      setItem("hasSeenRobuxBonusRobux2026_10", "true");
      break;
    default:
  }
};

// getLocalStorage is typed to return any, so override the warning
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getRobuxBadgeLocalStorage = (robuxBadgeType: string): any => {
  const localStorageKey = mapRobuxBadgeTypeToLocalStorageKey(robuxBadgeType);
  return localStorageKey === "" ? null : getItem(localStorageKey);
};

export const shouldShowRobuxUpdateBadge = (): ValueOf<typeof RobuxBadgeType> | null => {
  // There should only be one local storage field checked here at a time per label,
  // otherwise the red dot will not dismiss until the user clicks multiple times

  if (getRobuxBadgeLocalStorage(RobuxBadgeType.BONUS_ROBUX_2026_10) !== "true") {
    return RobuxBadgeType.BONUS_ROBUX_2026_10;
  }

  return null;
};
