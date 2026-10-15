import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Thumbnail2d,
  ThumbnailAvatarHeadshotSize,
  ThumbnailFormat,
  ThumbnailTypes,
} from "@rbx/thumbnails";
import { Icon } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { UserProfileField, useUserProfiles } from "@rbx/user-profile-api-client";
import { FriendRequestOriginSource } from "../constants/FriendRequestOriginSource";
import type { ProfileInsightJson } from "../constants/profileInsightsTypes";
import { trustedFriendsTranslationKeys } from "../constants/trustedFriendsModal";
import { fetchMultiProfileInsights } from "../services/multiProfileInsights";
import { formatTrustedFriendConnectionDurationFromUnix } from "../utils/formatTrustedFriendConnectionDurationFromUnix";

type DetailItem = {
  id: string;
  iconName: React.ComponentProps<typeof Icon>["name"];
  label: React.ReactNode;
};

type FriendRequestOriginDisplay = {
  iconName: DetailItem["iconName"];
  translationKey: (typeof trustedFriendsTranslationKeys)[keyof typeof trustedFriendsTranslationKeys];
};

export type SocialMetadataSectionProps = {
  userId: number;
};

type ParsedSocialInsights = {
  mutualFriendCount: number;
  friendshipStartUnixSeconds?: number;
  accountCreationYear?: number | string;
  userAgeVerifiedBracketCatalogKey?: string;
  friendRequestOriginDisplay?: FriendRequestOriginDisplay;
};

type InsightsState = ParsedSocialInsights;

const ORIGIN_DISPLAY_MAP: Partial<Record<FriendRequestOriginSource, FriendRequestOriginDisplay>> = {
  [FriendRequestOriginSource.QrCode]: {
    iconName: "icon-filled-squares-grid-qr",
    translationKey: trustedFriendsTranslationKeys.friendRequestOriginQrCode,
  },
  [FriendRequestOriginSource.PhoneContactImporter]: {
    iconName: "icon-filled-smartphone-portrait",
    translationKey: trustedFriendsTranslationKeys.friendRequestOriginPhoneContactImporter,
  },
  [FriendRequestOriginSource.PlayerSearch]: {
    iconName: "icon-filled-magnifying-glass",
    translationKey: trustedFriendsTranslationKeys.friendRequestOriginPlayerSearch,
  },
};

const emptyInsightsState: InsightsState = {
  mutualFriendCount: 0,
};

function isNonEmptyDetailLabel(label: React.ReactNode): boolean {
  if (!label) {
    return false;
  }
  if (typeof label === "string") {
    return label.length > 0;
  }
  return true;
}

function profileInsightDateTimeToUnixSeconds(value: unknown): number | undefined {
  if (typeof value === "string") {
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? Math.floor(ms / 1000) : undefined;
  }
  if (typeof value === "object" && value !== null && "seconds" in value) {
    const sec = value.seconds;
    return typeof sec === "number" && sec > 0 ? sec : undefined;
  }
  return undefined;
}

function parseProfileInsights(insights: ProfileInsightJson[]): ParsedSocialInsights {
  if (insights.length === 0) {
    return { mutualFriendCount: 0 };
  }

  let mutualFriendCount = 0;
  let friendshipStartUnixSeconds: number | undefined;
  let accountCreationYear: number | string | undefined;
  let userAgeVerifiedBracketCatalogKey: string | undefined;
  let friendRequestOriginDisplay: FriendRequestOriginDisplay | undefined;

  for (const insight of insights) {
    if (insight.userAgeVerifiedBracket) {
      userAgeVerifiedBracketCatalogKey = insight.userAgeVerifiedBracket;
    }

    const mutualFriends = insight.mutualFriendInsight?.mutualFriends;
    if (mutualFriends) {
      mutualFriendCount = Object.keys(mutualFriends).length;
    }

    const friendshipAge = insight.friendshipAgeInsight;
    const friendsSinceUnix = profileInsightDateTimeToUnixSeconds(
      friendshipAge?.friendsSinceDateTime,
    );
    if (friendsSinceUnix) {
      friendshipStartUnixSeconds = friendsSinceUnix;
    }

    const accountCreated = insight.accountCreationDateInsight;
    const accountCreatedUnix = profileInsightDateTimeToUnixSeconds(
      accountCreated?.accountCreatedDateTime,
    );
    if (accountCreatedUnix) {
      accountCreationYear = new Date(accountCreatedUnix * 1000).getFullYear();
    }

    const origin = insight.friendRequestOriginInsight;
    if (origin?.friendRequestOriginSource) {
      friendRequestOriginDisplay =
        ORIGIN_DISPLAY_MAP[origin.friendRequestOriginSource as FriendRequestOriginSource];
    }
  }

  return {
    mutualFriendCount,
    friendshipStartUnixSeconds,
    accountCreationYear,
    userAgeVerifiedBracketCatalogKey,
    friendRequestOriginDisplay,
  };
}

const SocialMetadataSection = ({ userId }: SocialMetadataSectionProps): React.JSX.Element => {
  const { translate } = useTranslation();

  const {
    data,
    isSuccess,
    isFetching: isFetchingInsights,
  } = useQuery({
    queryKey: ["multiProfileInsights", userId],
    queryFn: () => fetchMultiProfileInsights(userId),
  });

  const [insights, setInsights] = useState<InsightsState>(emptyInsightsState);

  useEffect(() => {
    if (!isSuccess) {
      setInsights(emptyInsightsState);
      return;
    }
    const row = data.userInsights?.find(
      u => u.targetUser === userId || String(u.targetUser) === String(userId),
    );
    const profileInsights = row?.profileInsights;
    const parsed = parseProfileInsights(Array.isArray(profileInsights) ? profileInsights : []);
    setInsights(parsed);
  }, [data, isSuccess, userId]);

  const {
    mutualFriendCount,
    friendshipStartUnixSeconds,
    accountCreationYear,
    userAgeVerifiedBracketCatalogKey,
    friendRequestOriginDisplay,
  } = insights;

  const userProfileFields = [UserProfileField.Names.CombinedName, UserProfileField.Names.Username];
  const { data: userProfiles } = useUserProfiles([userId], userProfileFields);

  const profileForUser = userProfiles?.[userId];

  const connectedForDisplay = useMemo(
    () =>
      formatTrustedFriendConnectionDurationFromUnix(
        friendshipStartUnixSeconds,
        translate,
        trustedFriendsTranslationKeys,
      ),
    [friendshipStartUnixSeconds, translate],
  );

  const ageCatalogKey = userAgeVerifiedBracketCatalogKey ?? "";
  const translatedAgeGroup = ageCatalogKey ? translate(ageCatalogKey) : "";
  const ageGroupRowLabel = translatedAgeGroup
    ? `${translate(trustedFriendsTranslationKeys.ageGroupLabel)} ${translatedAgeGroup}`
    : "";

  const visibleDetails = useMemo(() => {
    const details: DetailItem[] = [
      {
        id: "age-group",
        iconName: "icon-filled-shield-check",
        label: ageGroupRowLabel,
      },
      connectedForDisplay
        ? {
            id: "friendship-duration",
            iconName: "icon-filled-calendar",
            label: connectedForDisplay,
          }
        : {
            id: "not-a-friend",
            iconName: "icon-filled-triangle-exclamation",
            label: translate(trustedFriendsTranslationKeys.notAFriend),
          },
      mutualFriendCount > 0
        ? {
            id: "mutual-friends",
            iconName: "icon-filled-two-people" as const,
            label: translate(trustedFriendsTranslationKeys.mutualFriends, {
              numConnections: mutualFriendCount,
            }),
          }
        : {
            id: "no-mutual-friends",
            iconName: "icon-filled-triangle-exclamation",
            label: translate(trustedFriendsTranslationKeys.noMutualFriends),
          },
      ...(friendRequestOriginDisplay
        ? [
            {
              id: "friend-request-origin",
              iconName: friendRequestOriginDisplay.iconName,
              label: translate(friendRequestOriginDisplay.translationKey),
            },
          ]
        : []),
      {
        id: "joined-year",
        iconName: "icon-filled-circle-i" as const,
        label: translate(trustedFriendsTranslationKeys.joinedInYear, {
          year: accountCreationYear ?? "",
        }),
      },
    ];

    return details.filter(d => isNonEmptyDetailLabel(d.label));
  }, [
    accountCreationYear,
    ageGroupRowLabel,
    connectedForDisplay,
    friendRequestOriginDisplay,
    mutualFriendCount,
    translate,
  ]);

  return (
    <div className="radius-large bg-shift-100 padding-large flex flex-col gap-large">
      <div className="flex flex-row items-center gap-medium">
        <div className="trusted-friend-social-avatar-circle bg-shift-200">
          {/* Ungated: only the friends carousel is behind the profile-frame IXP gate. */}
          <Thumbnail2d
            containerClass="trusted-friend-social-avatar-thumb radius-circle"
            type={ThumbnailTypes.avatarHeadshot}
            size={ThumbnailAvatarHeadshotSize.size48}
            targetId={userId}
            format={ThumbnailFormat.webp}
            includeProfileFrame
          />
          <div className="trusted-friend-social-avatar-loading-overlay" aria-hidden />
        </div>
        <div className="flex flex-col gap-xxsmall min-width-0">
          <p className="text-heading-small text-overflow-ellipsis margin-none">
            {profileForUser?.names.combinedName ?? ""}
          </p>
          <p className="text-body-medium content-default text-overflow-ellipsis margin-none">
            {profileForUser?.names.username ?? ""}
          </p>
        </div>
      </div>
      {visibleDetails.length && !isFetchingInsights ? (
        <ul className="flex flex-row flex-wrap gap-medium justify-start items-center list-none margin-none padding-none">
          {visibleDetails.map(({ id, iconName, label }) => (
            <li key={id} className="inline-flex max-width-full flex-row items-center gap-xsmall">
              <Icon name={iconName} size="XSmall" className="content-default shrink-0" />
              <span className="text-body-medium content-default min-width-0">{label}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default SocialMetadataSection;
