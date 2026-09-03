import { useTranslation } from "@rbx/core-scripts/react";
import { Component } from "@rbx/profile-platform";
import useRenderBadgeItem from "../../hooks/useRenderBadgeItem";
import ProfileCarouselWithAnalytics from "../Common/ProfileCarouselWithAnalytics";

type PlayerBadgesProps = {
  userId: string;
  playerBadges: { id: number }[];
};

const PlayerBadges = ({ userId, playerBadges }: PlayerBadgesProps) => {
  const { translate } = useTranslation();
  const { renderBadgeItem, getItemId, onItemsImpressed } = useRenderBadgeItem();
  return (
    <ProfileCarouselWithAnalytics
      headerTitle={translate("Heading.PlayerAssetsBadges")}
      headerHref={`/users/${userId}/inventory/#!/badges`}
      items={playerBadges}
      renderItem={renderBadgeItem}
      getItemId={getItemId}
      onItemsImpressed={onItemsImpressed}
      component={Component.PlayerBadges}
    />
  );
};

export default PlayerBadges;
