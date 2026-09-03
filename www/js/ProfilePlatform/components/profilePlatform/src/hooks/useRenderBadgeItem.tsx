import { useCallback } from "react";
import { ThumbnailTypes } from "@rbx/thumbnails";
import { formatSeoName } from "@rbx/core-scripts/format/string";
import BaseTile from "../components/Common/BaseTile/BaseTile";
import useFetchBadgeById from "./useFetchBadgeById";

const BadgeCarouselItem = ({ badge }: { badge: { id: number } }) => {
  // Interm solution while we wait for badge api team to provide a batch endpoint
  const { badge: fetchedBadge, isLoading } = useFetchBadgeById(badge.id);
  if (isLoading || !fetchedBadge) {
    return null;
  }

  return (
    <BaseTile
      type={ThumbnailTypes.badgeIcon}
      targetId={badge.id}
      href={`/badges/${badge.id}/${formatSeoName(fetchedBadge.name)}`}
      title={fetchedBadge.name}
      titleTag={fetchedBadge.name}
    />
  );
};

const useRenderBadgeItem = () => {
  const renderBadgeItem = useCallback(
    (badge: { id: number }) => <BadgeCarouselItem badge={badge} />,
    [],
  );

  const getItemId = useCallback((badge: { id: number }) => badge.id, []);

  const onItemsImpressed = useCallback((_itemIndexes: number[]) => {
    // TODO: Implement analytics for badge item impressions
  }, []);

  return { renderBadgeItem, getItemId, onItemsImpressed };
};

export default useRenderBadgeItem;
