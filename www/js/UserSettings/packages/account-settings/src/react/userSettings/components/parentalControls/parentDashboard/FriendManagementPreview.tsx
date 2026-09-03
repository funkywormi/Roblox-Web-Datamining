import React from "react";
import PreviewCardDescription from "../../../../common/components/PreviewCardDescription";
import {
  useGetChildFriendsCountQuery,
  useGetChildFriendsQuery,
} from "../../../../apis/parentalControlsApi";
import { useAppSelector } from "../../../../redux/hooks";
import { selectChildPagesForChildUserId } from "../../../../apis/slices/childPagesSlice";
import PreviewCard from "../../../../common/components/routing/PreviewCard";
import FriendsCarousel from "./FriendsCarousel";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import { FindFriendsTypes, FindFriendsUserSort } from "../../../../../types/friendsTypes";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import { useWrappedTranslation } from "../../../hooks/useWrappedTranslation";
import parentalControlsEventService from "../../../services/eventServices/parentalControlsEventService";

const FriendManagementPreview = ({ child }: { child: TChildInfo }): JSX.Element => {
  const { userId: childUserId, canParentManageChildsFriends = false } = child;

  const childPages = useAppSelector(selectChildPagesForChildUserId(childUserId));
  const { translate } = useWrappedTranslation();

  const { data: friendData, isError: friendError } = useGetChildFriendsQuery({
    userId: childUserId,
    userSort: FindFriendsUserSort.FriendScore,
    findFriendsType: FindFriendsTypes.Friends,
  });

  const { data: countData, isError: countError } = useGetChildFriendsCountQuery(childUserId);

  const renderPreviewCard = (
    children?: JSX.Element,
    displayLink?: boolean,
    removePadding = false,
  ) => (
    <PreviewCard
      title={translate(
        parentalControlsTranslationConstants.friendManagement.previewCard.titleWithCount,
        {
          numberOfFriends: countError ? friendData?.PageItems.length : countData?.count,
        },
      )}
      linkText={translate(
        canParentManageChildsFriends
          ? commonTranslationConstants.manage
          : parentalControlsTranslationConstants.friendManagement.more,
      )}
      linkPath={childPages?.friendManagementPage.path}
      noPadding={removePadding}
      displayLink={displayLink}
      onClick={() => {
        parentalControlsEventService.authButtonClickSettingsPControlsConnectionsMore(child);
      }}
    >
      {children}
    </PreviewCard>
  );

  if (friendError) {
    return renderPreviewCard(
      <PreviewCardDescription
        description={translate(parentalControlsTranslationConstants.errorLoadingList)}
      />,
      false,
    );
  }

  if (friendData?.PageItems.length === 0) {
    return renderPreviewCard(
      <PreviewCardDescription
        description={translate(
          parentalControlsTranslationConstants.friendManagement.carousel.noFriends,
        )}
      />,
      false,
    );
  }

  // There are friends to display
  return renderPreviewCard(<FriendsCarousel userId={childUserId} />, true, true);
};

export default FriendManagementPreview;
