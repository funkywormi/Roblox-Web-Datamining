import React, { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { Loading } from "react-style-guide";
import { useTranslation } from "react-utilities";
import { useSnackbar } from "@rbx/user-settings";
import { useGetGamesDetailsQuery } from "../../../../apis/gameDetailsApi";
import { useGetTransferRequestsByIdsQuery } from "../../../../apis/robuxTransferApi";
import InformationalScreen from "../../../../common/components/InformationalScreen";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import { ParentConsentType, TransferType } from "../../../../../types/parentConsentsTypes";
import useGetAllPendingParentalConsents from "../../../hooks/useGetAllPendingParentalConsents";
import ConsentCenterCard from "./ConsentCenterCard";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";

const ConsentCenter = ({ child }: { child: TChildInfo }): JSX.Element => {
  const { snackbarService } = useSnackbar();
  const { translate } = useTranslation();

  const { allConsents, isError, isLoading, hasMore, loadMore, isFetchingMore } =
    useGetAllPendingParentalConsents(child?.userId);

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

  const transferRequestIds = useMemo(
    () =>
      allConsents
        .filter(
          consent =>
            consent &&
            (consent.consentType === ParentConsentType.ReceiveTransfer ||
              consent.consentType === ParentConsentType.SendTransfer) &&
            consent.consentData?.transferType === TransferType.Robux &&
            consent.consentData.transferId !== undefined,
        )
        .map(consent => consent.consentData!.transferId!)
        .filter((id): id is number => id !== undefined),
    [allConsents],
  );
  const { data: robuxTransferDetailsResult } = useGetTransferRequestsByIdsQuery(
    transferRequestIds,
    {
      skip: transferRequestIds.length === 0,
    },
  );

  const getPendingConsentCards = (): JSX.Element | undefined => {
    const consentCards = allConsents?.map(
      consent =>
        consent && (
          <ConsentCenterCard
            key={consent.id}
            child={child}
            consent={consent}
            experienceName={gameDetailsResult?.[consent.consentData?.universeId || 0]?.name || ""}
            robuxTransfer={
              robuxTransferDetailsResult?.[consent.consentData?.transferId || 0] || undefined
            }
          />
        ),
    );

    if (isError)
      return (
        <InformationalScreen descriptionTranslationKey={commonTranslationConstants.unknownError} />
      );

    if (isLoading) return <Loading />;

    if (allConsents?.length === 0)
      return (
        <InformationalScreen
          descriptionTranslationKey={
            parentalControlsTranslationConstants.parentalConsents.allCaughtUp
          }
        />
      );

    return (
      <React.Fragment>
        {consentCards}
        {/* Infinite scroll sentinel */}
        <div ref={loadMoreRef}>{isFetchingMore && <Loading />}</div>
      </React.Fragment>
    );
  };

  return <div>{getPendingConsentCards()}</div>;
};

export default ConsentCenter;
