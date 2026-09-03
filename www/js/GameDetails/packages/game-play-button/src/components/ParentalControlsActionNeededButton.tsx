import React, { useCallback } from "react";
import { Loading } from "@rbx/core-ui/legacy/react-style-guide";
import { TranslateFunction, withTranslations } from "@rbx/core-scripts/legacy/react-utilities";
import ActionNeededButton from "./ActionNeededButton";
import SelfUpdateSettingModal from "./SelfUpdateSettingModal";
import { translations } from "../constants/translations";
import RestrictedUnplayableModal from "./RestrictedUnplayableModal";
import useFetchParentalControlsUpsellData from "../hooks/useFetchParentalControlsUpsellData";
import useContextualParentalControlsUpsell from "../hooks/useContextualParentalControlsUpsell";
import {
  TAppsFlyerReferralProperties,
  type TPlayButtonPageContext,
} from "../types/playButtonTypes";

type TParentalControlsActionNeededButtonProps = {
  universeId: string;
  buttonClassName?: string;
  placeId: string;
  rootPlaceId?: string;
  privateServerLinkCode?: string;
  gameInstanceId?: string;
  eventProperties?: Record<string, string | number | undefined>;
  appsFlyerReferralProperties?: TAppsFlyerReferralProperties;
  pageContext: TPlayButtonPageContext;
};

const ParentalControlsActionNeededButton = ({
  universeId,
  buttonClassName,
  placeId,
  rootPlaceId,
  privateServerLinkCode,
  gameInstanceId,
  eventProperties,
  appsFlyerReferralProperties,
  pageContext,
  translate,
}: TParentalControlsActionNeededButtonProps & {
  translate: TranslateFunction;
}) => {
  const { contentAgeRestriction, contentMaturityRating, isFetching, hasError } =
    useFetchParentalControlsUpsellData(universeId);

  const {
    launchPlayButtonUpsell,
    isSelfUpdateSettingModalOpen,
    navigateToAccountSettings,
    closeSelfUpdateSettingModal,
    isRestrictedUnplayableModalOpen,
    closeRestrictedUnplayableModal,
  } = useContextualParentalControlsUpsell(
    placeId,
    universeId,
    pageContext,
    rootPlaceId,
    privateServerLinkCode,
    gameInstanceId,
    eventProperties,
    appsFlyerReferralProperties,
  );

  const onPlayButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      launchPlayButtonUpsell(contentAgeRestriction, contentMaturityRating, hasError);
    },
    [launchPlayButtonUpsell, contentAgeRestriction, contentMaturityRating, hasError],
  );

  if (!hasError && isFetching) {
    return <Loading />;
  }

  return (
    <React.Fragment>
      <ActionNeededButton onButtonClick={onPlayButtonClick} buttonClassName={buttonClassName} />
      {isSelfUpdateSettingModalOpen && (
        <SelfUpdateSettingModal
          isModalOpen={isSelfUpdateSettingModalOpen}
          navigateToAccountSettings={navigateToAccountSettings}
          closeModal={closeSelfUpdateSettingModal}
          translate={translate}
        />
      )}
      {isRestrictedUnplayableModalOpen && (
        <RestrictedUnplayableModal
          isModalOpen={isRestrictedUnplayableModalOpen}
          closeModal={closeRestrictedUnplayableModal}
          translate={translate}
        />
      )}
    </React.Fragment>
  );
};

ParentalControlsActionNeededButton.defaultProps = {
  buttonClassName: undefined,
  rootPlaceId: undefined,
  privateServerLinkCode: undefined,
  gameInstanceId: undefined,
  eventProperties: {},
  appsFlyerReferralProperties: {},
};

export default withTranslations<TParentalControlsActionNeededButtonProps>(
  ParentalControlsActionNeededButton,
  translations,
);
