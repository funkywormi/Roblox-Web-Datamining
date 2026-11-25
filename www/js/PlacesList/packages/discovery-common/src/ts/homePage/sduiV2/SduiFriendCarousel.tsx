"use client";

import React, { useCallback, useState } from "react";
import environmentUrls from "@rbx/environment-urls";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  findAnalyticsFieldInAncestors,
  type SduiRendererInjectedProps,
  type SduiResolvedAction,
} from "@rbx/sdui-core";
import { SduiSectionHeader } from "@rbx/sdui-common";
import { usePageSession } from "../../common/utils/PageSessionContext";
import FriendsCarousel from "../FriendsCarousel";
import "./sduiFriendCarousel.css";

export type SduiFriendCarouselProps = SduiRendererInjectedProps & {
  /** Bound from the friends sort id. The existing carousel expects a number. */
  sortId?: string;
  /**
   * Header title from the template, built from the backend friend count, as in
   * "Friends (138)". Unset falls back to "Friends". An empty string means the
   * backend counted no friends. The row then takes no space unless the
   * carousel's own check shows it, for example for pending friend requests.
   */
  title?: string;
  /** HTML element for the title. Defaults to the legacy header's h2. */
  titleHeadingLevel?: string;
};

/**
 * This wrapper mounts the existing friends carousel and only passes sort and analytics
 * context.
 * The carousel's own header is hidden. The title is the same clickable sort
 * header Charts uses, and it opens the friends page the legacy See All opened.
 */
export function SduiFriendCarousel({
  sortId,
  title,
  titleHeadingLevel = "h2",
  analyticsContext,
}: SduiFriendCarouselProps): React.JSX.Element {
  const { translate } = useTranslation();
  const homePageSessionInfo = usePageSession();
  const [isShownByCarousel, setIsShownByCarousel] = useState(false);
  const handleVisibilityResolved = useCallback((isVisible: boolean) => {
    setIsShownByCarousel(isVisible);
  }, []);

  const hasTitle = title?.trim() !== "";
  const isCollapsed = !hasTitle && !isShownByCarousel;
  const parsedSortId = sortId != null && sortId !== "" ? Number(sortId) : Number.NaN;
  // SDUI's collectionPosition is one-based. The legacy click and impression trackers
  // add 1 to sortPosition, so they need it zero-based.
  const collectionPosition = findAnalyticsFieldInAncestors("collectionPosition", analyticsContext);
  const sortPosition =
    typeof collectionPosition === "number" && collectionPosition >= 1
      ? collectionPosition - 1
      : undefined;
  const friendsUrl = `${environmentUrls.websiteUrl}/users/friends#!/friends`;
  const openFriends: SduiResolvedAction = {
    href: friendsUrl,
    onActivated: () => undefined,
    onActivatedAsync: () => Promise.resolve(),
  };

  return (
    <div
      className={
        isCollapsed
          ? "sdui-home-friends-carousel sdui-home-friends-carousel-collapsed"
          : "sdui-home-friends-carousel"
      }
    >
      {!isCollapsed && (
        <SduiSectionHeader
          titleText={hasTitle && title != null ? title : translate("Label.Friends")}
          titleHeadingLevel={titleHeadingLevel}
          titleIcon="icon icon-regular-chevron-large-right"
          titleIconWidth={16}
          onTitleActivated={openFriends}
        />
      )}
      <FriendsCarousel
        homePageSessionInfo={homePageSessionInfo}
        sortId={Number.isFinite(parsedSortId) ? parsedSortId : undefined}
        sortPosition={sortPosition}
        onVisibilityResolved={hasTitle ? undefined : handleVisibilityResolved}
      />
    </div>
  );
}

export default SduiFriendCarousel;
