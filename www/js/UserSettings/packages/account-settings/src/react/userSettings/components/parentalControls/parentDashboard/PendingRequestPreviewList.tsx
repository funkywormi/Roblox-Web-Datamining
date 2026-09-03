import React, { useMemo } from "react";
import { useTranslation } from "react-utilities";
import PreviewCardDescription from "../../../../common/components/PreviewCardDescription";
import { useAppSelector } from "../../../../redux/hooks";
import { selectChildPagesForChildUserId } from "../../../../apis/slices/childPagesSlice";
import PreviewCard from "../../../../common/components/routing/PreviewCard";
import useGetAllPendingParentalConsents from "../../../hooks/useGetAllPendingParentalConsents";
import PendingRequestPreviewListItem from "./PendingRequestPreviewListItem";
import { useGetChildrenInfoQuery } from "../../../../apis/parentalControlsApi";
import { useGetGamesDetailsQuery } from "../../../../apis/gameDetailsApi";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";

const PendingRequestPreviewList = ({ childUserId }: { childUserId: number }): JSX.Element => {
  const { translate } = useTranslation();
  const { parentalConsents } = parentalControlsTranslationConstants;

  const { allConsents, isError, hasMore } = useGetAllPendingParentalConsents(childUserId);
  const childPages = useAppSelector(selectChildPagesForChildUserId(childUserId));
  const { data: childrenInfo } = useGetChildrenInfoQuery();
  const canSeeChatTerminology =
    childrenInfo?.childrenInfoList.find(child => child.userId === childUserId)
      ?.canSeeChatTerminology ?? false;

  const consentsCountDisplay = hasMore ? `${allConsents?.length}+` : allConsents?.length;

  const universeIds = useMemo(
    () =>
      allConsents.map(consent => consent?.consentData?.universeId).filter(id => id !== undefined),
    [allConsents],
  );
  const { data: gameDetailsResult } = useGetGamesDetailsQuery(universeIds, {
    skip: universeIds.length === 0,
  });

  const getPendingRequestListItems = (): JSX.Element | undefined => {
    const listItems = allConsents
      ?.slice(0, 5)
      .map(
        consent =>
          consent && (
            <PendingRequestPreviewListItem
              key={consent.id}
              consent={consent}
              isChildSide={false}
              experienceName={gameDetailsResult?.[consent.consentData?.universeId || 0]?.name || ""}
              canSeeChatTerminology={canSeeChatTerminology}
            />
          ),
      );

    return (
      <React.Fragment>
        {listItems ?? (
          <div className="text-description">{translate(parentalConsents.noRequests)}</div>
        )}
      </React.Fragment>
    );
  };

  const renderPreviewCard = (children?: JSX.Element, displayLink?: boolean) => (
    <PreviewCard
      title={translate(parentalConsents.pendingRequests)}
      linkText={translate(commonTranslationConstants.seeAllWithNumber, {
        numberOfItems: consentsCountDisplay,
      })}
      linkPath={childPages?.consentCenterPage.path}
      displayLink={displayLink}
    >
      {children}
    </PreviewCard>
  );

  if (isError) {
    return renderPreviewCard(
      <PreviewCardDescription
        description={translate(parentalControlsTranslationConstants.errorLoadingList)}
      />,
      false,
    );
  }

  if (allConsents?.length === 0) {
    return renderPreviewCard(
      <PreviewCardDescription
        description={
          childUserId
            ? translate(parentalConsents.allCaughtUp)
            : translate(parentalConsents.noRequests)
        }
      />,
      false,
    );
  }

  return renderPreviewCard(getPendingRequestListItems(), true);
};

export default PendingRequestPreviewList;
