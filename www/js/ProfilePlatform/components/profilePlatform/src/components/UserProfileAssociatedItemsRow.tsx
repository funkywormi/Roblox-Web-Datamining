import { useMemo, useCallback, memo } from "react";
import { Component } from "@rbx/profile-platform";
import { useTranslation } from "@rbx/core-scripts/react";
import { truncNumber, SuffixNames } from "@rbx/core-scripts/format/number";
import { Chip } from "@rbx/foundation-ui";
import { AssociatedItemsRow } from "@rbx/discovery-sdui-components";
import useProfileJsonComponent from "../hooks/useProfileJsonComponent";
import { useProfilePlatformContext } from "../context/ProfilePlatformContext";

interface CountsData {
  followersCount?: number;
  followingsCount?: number;
  friendsCount?: number;
  isFollowersCountEnabled?: boolean;
  isFollowingsCountEnabled?: boolean;
  isFriendsCountEnabled?: boolean;
}

interface SocialCountItem {
  id: string;
  count: number;
  text: string;
  href?: string;
}

const UserProfileAssociatedItemsRow = () => {
  const { translate } = useTranslation();
  const { profileId } = useProfilePlatformContext();
  const headerData = useProfileJsonComponent(Component.UserProfileHeader);
  const counts: CountsData = headerData?.counts ?? {};
  const {
    followersCount = 0,
    followingsCount = 0,
    friendsCount = 0,
    isFollowersCountEnabled = false,
    isFollowingsCountEnabled = false,
    isFriendsCountEnabled = false,
  } = counts;

  const formatCount = useCallback((count: number) => {
    let truncatedNumber = truncNumber(count, 1000, SuffixNames.withoutPlus, 1);
    // Remove trailing .0 if present (same logic as old SocialCount)
    const truncatedNumberHasDecimal = truncatedNumber.indexOf(".0");
    if (truncatedNumberHasDecimal !== -1) {
      truncatedNumber =
        truncatedNumber.substring(0, truncatedNumberHasDecimal) +
        truncatedNumber.substring(truncatedNumberHasDecimal + 2);
    }
    return truncatedNumber;
  }, []);

  const items: SocialCountItem[] = useMemo(
    () => [
      {
        id: "connections",
        count: friendsCount,
        text: `${formatCount(friendsCount)} ${translate(
          friendsCount === 1 ? "Label.Friend" : "Label.Friends",
        )}`,
        href: isFriendsCountEnabled ? `/users/${profileId}/friends#!/friends` : undefined,
      },
      {
        id: "followers",
        count: followersCount,
        text: `${formatCount(followersCount)} ${translate(followersCount === 1 ? "Label.Follower" : "Label.Followers")}`,
        href: isFollowersCountEnabled ? `/users/${profileId}/friends#!/followers` : undefined,
      },
      {
        id: "following",
        count: followingsCount,
        text: `${formatCount(followingsCount)} ${translate("Label.Following")}`,
        href: isFollowingsCountEnabled ? `/users/${profileId}/friends#!/following` : undefined,
      },
    ],
    [
      friendsCount,
      followersCount,
      followingsCount,
      translate,
      formatCount,
      isFriendsCountEnabled,
      isFollowersCountEnabled,
      isFollowingsCountEnabled,
      profileId,
    ],
  );

  const renderSocialCountItem = useCallback(
    (item: SocialCountItem) => (
      <Chip key={item.id} as="a" text={item.text} href={item.href} isDisabled={item.count === 0} />
    ),
    [],
  );

  return <AssociatedItemsRow items={items} renderItem={renderSocialCountItem} />;
};

export default memo(UserProfileAssociatedItemsRow);
