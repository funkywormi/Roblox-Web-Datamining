import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-utilities";
import { useInView } from "react-intersection-observer";
import { Loading } from "react-style-guide";
import { authenticatedUser } from "header-scripts";
import { List } from "@rbx/foundation-ui";
import { useSnackbar } from "@rbx/user-settings";
import { useGetGamesDetailsQuery } from "../../../../apis/gameDetailsApi";
import PreviewCardDescription from "../../../../common/components/PreviewCardDescription";
import PreviewCard from "../../../../common/components/routing/PreviewCard";
import useGetAllPendingParentalConsents from "../../../hooks/useGetAllPendingParentalConsents";
import PendingRequestPreviewListItem from "../parentDashboard/PendingRequestPreviewListItem";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import { useGetSettingsUiPolicyQuery } from "../../../../apis/universalAppConfigurationApi";

export const SentRequestsList = (): JSX.Element => {
  const { snackbarService } = useSnackbar();
  const { translate } = useTranslation();
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const canSeeChatTerminology = uiPolicy?.canSeeChatTerminology ?? false;

  const { allConsents, isError, isLoading, hasMore, loadMore, isFetchingMore } =
    useGetAllPendingParentalConsents(authenticatedUser.id ?? undefined);
  const consents = allConsents.filter(Boolean);

  // Infinite scroll - load more when bottom sentinel comes into view
  const { ref: loadMoreRef, inView } = useInView();
  useEffect(() => {
    if (inView && hasMore && !isFetchingMore) {
      loadMore().catch(() => {
        snackbarService.warning(translate(commonTranslationConstants.unknownError));
      });
    }
  }, [inView, hasMore, isFetchingMore, loadMore, snackbarService, translate]);

  const universeIds = useMemo(
    () =>
      allConsents.map(consent => consent?.consentData?.universeId).filter(id => id !== undefined),
    [allConsents],
  );
  const { data: gameDetailsResult } = useGetGamesDetailsQuery(universeIds, {
    skip: universeIds.length === 0,
  });

  const getSentRequestListItems = (): JSX.Element | undefined => {
    const consentCards = consents.map((consent, index) => (
      <PendingRequestPreviewListItem
        key={consent.id}
        consent={consent}
        isChildSide
        experienceName={gameDetailsResult?.[consent.consentData?.universeId || 0]?.name || ""}
        divider={index === consents.length - 1 ? "None" : "Full"}
        canSeeChatTerminology={canSeeChatTerminology}
      />
    ));

    return (
      <React.Fragment>
        <List className="bg-shift-100 stroke-standard stroke-default radius-large clip">
          {consentCards}
        </List>
        {/* Infinite scroll sentinel */}
        <div ref={loadMoreRef}>{isFetchingMore && <Loading />}</div>
      </React.Fragment>
    );
  };

  const renderPreviewCard = (children?: JSX.Element) => (
    <PreviewCard
      title={translate(parentalControlsTranslationConstants.parentalConsents.sentRequests)}
    >
      {children}
    </PreviewCard>
  );
  if (isError) {
    return renderPreviewCard(
      <PreviewCardDescription
        description={translate(parentalControlsTranslationConstants.errorLoadingList)}
      />,
    );
  }

  if (isLoading) {
    return renderPreviewCard(<Loading />);
  }

  if (consents.length === 0) {
    return renderPreviewCard(
      <PreviewCardDescription
        description={translate(parentalControlsTranslationConstants.parentalConsents.noRequests)}
      />,
    );
  }

  return renderPreviewCard(getSentRequestListItems());
};

export default SentRequestsList;
