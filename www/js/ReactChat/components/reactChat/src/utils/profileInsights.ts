import { FRIENDSHIP_ORIGIN_TYPE } from "../constants/chatModalConstants";
import type { TCountryRegion, TProfileInsight } from "../types/api";

const SECONDS_PER_DAY = 60 * 60 * 24;
const SECONDS_PER_MONTH = SECONDS_PER_DAY * 30;
const SECONDS_PER_YEAR = SECONDS_PER_DAY * 365;

export type TProfileInsightEntry = { iconClass: string; text: string };

export type TProcessedProfileInsights = {
  entries: TProfileInsightEntry[];
  /** Verified age-band caption shown next to the display name (not a list entry). */
  ageCheckInsightText?: string;
};

type TTranslate = (key: string, parameters?: Record<string, unknown>) => string;

type TProcessOptions = {
  translate: TTranslate;
  countryRegions: Record<string, TCountryRegion>;
  /** Current time in ms; injected for deterministic friendship-age math and testing. */
  nowMs: number;
};

const friendshipAgeText = (
  friendshipStartSeconds: number,
  nowMs: number,
  translate: TTranslate,
): string => {
  const nowInSeconds = nowMs / 1000;
  const elapsed = nowInSeconds - friendshipStartSeconds;
  const years = Math.floor(elapsed / SECONDS_PER_YEAR);
  const months = Math.floor(elapsed / SECONDS_PER_MONTH);
  const days = Math.floor(elapsed / SECONDS_PER_DAY);

  if (years > 0) {
    return years === 1
      ? translate("Label.ConnectedOneYear")
      : translate("Label.ConnectedNumYears", { num: years });
  }
  if (months > 0) {
    return months === 1
      ? translate("Label.ConnectedOneMonth")
      : translate("Label.ConnectedNumMonths", { num: months });
  }
  if (days > 0) {
    return days === 1
      ? translate("Label.ConnectedOneDay")
      : translate("Label.ConnectedNumDays", { num: days });
  }
  return translate("Label.NewFriend");
};

/**
 * Turn raw profile insights into displayable contact-card rows (icon + text), plus the verified
 * age-band caption. Pure port of the legacy chat contactCardController.processProfileInsights,
 * preserving order: mutual friends, friendship age, account location, join year, friendship origin.
 */
export const processProfileInsights = (
  insights: TProfileInsight[] | undefined,
  { translate, countryRegions, nowMs }: TProcessOptions,
): TProcessedProfileInsights => {
  if (!Array.isArray(insights)) {
    return { entries: [], ageCheckInsightText: undefined };
  }

  const entries: TProfileInsightEntry[] = [];
  let ageCheckInsightText: string | undefined;

  insights.forEach(insight => {
    if (insight.mutualFriendInsight) {
      const numMutualFriends = Object.keys(insight.mutualFriendInsight.mutualFriends ?? {}).length;
      entries.push({
        iconClass: "icon-filled-two-people",
        text:
          numMutualFriends === 1
            ? translate("Label.MutualFriendTitle")
            : translate("Label.MutualFriendsTitle", { numConnections: numMutualFriends }),
      });
    }

    const friendshipStartSeconds = insight.friendshipAgeInsight?.friendsSinceDateTime?.seconds;
    if (friendshipStartSeconds) {
      entries.push({
        iconClass: "icon-filled-calendar",
        text: friendshipAgeText(friendshipStartSeconds, nowMs, translate),
      });
    }

    const countryDisplayName =
      countryRegions[insight.accountLocationInsight?.accountLocationCode ?? ""]?.displayName;
    if (countryDisplayName) {
      entries.push({ iconClass: "icon-filled-globe-simplified", text: countryDisplayName });
    }

    const accountCreationSeconds =
      insight.accountCreationDateInsight?.accountCreatedDateTime?.seconds;
    if (accountCreationSeconds) {
      const year = new Date(accountCreationSeconds * 1000).getFullYear();
      entries.push({
        iconClass: "icon-filled-circle-i",
        text: translate("Label.JoinedInYear", { year }),
      });
    }

    const originSource = insight.friendRequestOriginInsight?.friendRequestOriginSource;
    if (originSource === FRIENDSHIP_ORIGIN_TYPE.qr_code) {
      entries.push({
        iconClass: "icon-regular-squares-grid-qr",
        text: translate("Description.FromQrCode"),
      });
    } else if (originSource === FRIENDSHIP_ORIGIN_TYPE.phone_contact_importer) {
      entries.push({
        iconClass: "icon-filled-smartphone-portrait",
        text: translate("Description.FromContacts"),
      });
    }

    const ageCheckInsightKey = insight.userAgeVerifiedInsight?.verifiedAgeBandLabel;
    if (ageCheckInsightKey) {
      ageCheckInsightText = translate(ageCheckInsightKey);
    }
  });

  return { entries, ageCheckInsightText };
};
