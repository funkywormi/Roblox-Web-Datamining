import React from "react";
import PreviewCard from "../../../../common/components/routing/PreviewCard";
import PreviewCardDescription from "../../../../common/components/PreviewCardDescription";
import FriendsCarousel from "../parentDashboard/FriendsCarousel";
import {
  useGetChildFriendsCountQuery,
  useGetChildFriendsQuery,
} from "../../../../apis/parentalControlsApi";
import { FindFriendsTypes, FindFriendsUserSort } from "../../../../../types/friendsTypes";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { useWrappedTranslation } from "../../../hooks/useWrappedTranslation";

export const FriendsPreviewCard = ({
  userId,
  linkText,
  linkPath,
  onLinkClick,
}: {
  userId: number;
  linkText: string;
  linkPath: string | undefined;
  onLinkClick?: () => void;
}): JSX.Element => {
  const { translate } = useWrappedTranslation();

  const { data: friendData, isError: isFriendsError } = useGetChildFriendsQuery({
    userId,
    userSort: FindFriendsUserSort.FriendScore,
    findFriendsType: FindFriendsTypes.Friends,
  });

  const { data: countData, isError: isCountError } = useGetChildFriendsCountQuery(userId);

  const numberOfFriends = isCountError ? friendData?.PageItems.length : countData?.count;

  const renderPreviewCard = (children: JSX.Element, displayLink: boolean, noPadding = false) => (
    <PreviewCard
      title={translate(
        parentalControlsTranslationConstants.friendManagement.previewCard.titleWithCount,
        { numberOfFriends },
      )}
      linkText={linkText}
      linkPath={linkPath}
      displayLink={displayLink}
      noPadding={noPadding}
      onClick={onLinkClick}
    >
      {children}
    </PreviewCard>
  );

  if (isFriendsError) {
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

  return renderPreviewCard(<FriendsCarousel userId={userId} />, true, true);
};

export default FriendsPreviewCard;
