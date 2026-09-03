import { useCallback } from "react";
import {
  Component,
  ProfileCarouselContainer,
  ProfileCarouselContainerProps,
} from "@rbx/profile-platform";
import analyticsService from "../../analytics/analyticsService";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";
import { EventNames, Buttons } from "../../analytics/constants";

type ProfileCarouselWithAnalyticsProps<TCollectionItem> =
  ProfileCarouselContainerProps<TCollectionItem> & {
    getItemId: (item: TCollectionItem) => string | number;
    component: Component;
  };

const ProfileCarouselWithAnalytics = <TCollectionItem,>(
  props: ProfileCarouselWithAnalyticsProps<TCollectionItem>,
) => {
  const { onHeaderClick, onItemClick, onItemsImpressed, getItemId, component } = props;
  const { profileId, profileType, profileSessionId } = useProfilePlatformContext();

  const onHeaderClickWithAnalytics = useCallback(() => {
    analyticsService.fireAnalyticsEvent(profileType, EventNames.BUTTON_CLICK, {
      profileId,
      profileType,
      profileSessionId,
      btn: Buttons.COMPONENT_HEADER,
      btnContext: component,
    });
    onHeaderClick?.();
  }, [profileId, profileType, profileSessionId, onHeaderClick, component]);

  const onItemClickWithAnalytics = useCallback(
    (item: TCollectionItem, itemIndex: number) => {
      analyticsService.fireAnalyticsEvent(profileType, EventNames.BUTTON_CLICK, {
        profileId,
        profileType,
        profileSessionId,
        btn: Buttons.COMPONENT_ITEM,
        btnContext: component,
        btnUnitId: getItemId(item),
        btnSortPosition: itemIndex + 1,
      });
      onItemClick?.(item, itemIndex);
    },
    [profileId, profileType, profileSessionId, onItemClick, getItemId, component],
  );

  return (
    <ProfileCarouselContainer
      {...props}
      onHeaderClick={onHeaderClickWithAnalytics}
      onItemClick={onItemClickWithAnalytics}
      onItemsImpressed={onItemsImpressed}
    />
  );
};

export default ProfileCarouselWithAnalytics;
