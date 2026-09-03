import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-utilities";
import { Button } from "@rbx/foundation-ui";
import { useSettingsModal, UserSetting } from "@rbx/user-settings";
import accountInfoTranslationConstants from "../../constants/contentConstants/accountInfoTranslationConstants";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import { accountInfoPageViewFaeAvailable } from "../../services/eventServices/verificationEventService";
import useAgeVerificationUpsell from "../../hooks/useAgeVerificationUpsell";
import useGetPendingParentalConsentRequest from "../../hooks/useGetPendingParentalConsentRequest";
import { ParentConsentType } from "../../../../types/parentConsentsTypes";
import useCancelConsentRequestModalV2 from "../../../common/hooks/modals/useCancelConsentRequestModalV2";
import { useGetAgeGroupQuery } from "../../../apis/accountInsightsApi";
import { eventConstants } from "../../constants/eventConstants";

const AgeVerificationV2 = (): React.JSX.Element | null => {
  const { translate } = useTranslation();
  const { data: ageGroup } = useGetAgeGroupQuery({});

  const {
    faeAvailable,
    idvAvailable,
    vpcForFaeAvailable,
    undoAgeVerificationAvailable,
    acceptDownageAvailable,
    requireIDReverification,
    handleFAEClick,
    handleIDVClick,
    handleVpcForFaeClick,
    errorModal,
    eligibleForAgeVerificationUndo,
    handleUndoAgeVerificationClick,
    handleAcceptDownageClick,
    isAcceptingDownage,
  } = useAgeVerificationUpsell();

  const faeAvailableEffective = faeAvailable;
  const vpcForFaeAvailableEffective = vpcForFaeAvailable;
  const showFAEButton = faeAvailableEffective || vpcForFaeAvailableEffective;
  const showIDVButton = idvAvailable;

  const pendingConsent = useGetPendingParentalConsentRequest(
    ParentConsentType.UpdateUserSetting,
    UserSetting.allowFacialAgeEstimation,
  );
  const pendingConsentValue = pendingConsent?.consentData?.[UserSetting.allowFacialAgeEstimation];
  const [cancelConsentRequestModal, cancelConsentRequestModalService] =
    useCancelConsentRequestModalV2({
      pendingConsent,
    });

  // U5 FAE results land the user in pending downage but are not a valid age check
  // per AMP's GetAgeBandLabel rule, so we hide the accept-downage action and swap
  // in U5-specific copy. Detection key matches the backend contract.
  const isU5PendingDownage =
    acceptDownageAvailable &&
    ageGroup?.estimatedAgeGroupTranslationKey ===
      accountInfoTranslationConstants.ageVerificationV2.estimatedAgeGroupU5;

  const getHeading = useMemo(() => {
    if (acceptDownageAvailable) {
      const estimatedAgeGroup = ageGroup?.estimatedAgeGroupTranslationKey
        ? translate(ageGroup.estimatedAgeGroupTranslationKey)
        : "";
      if (isU5PendingDownage) {
        return estimatedAgeGroup;
      }
      return `${translate(accountInfoTranslationConstants.ageVerificationV2.acceptDownageHeading)} ${estimatedAgeGroup}`;
    }
    if (requireIDReverification && idvAvailable && !showFAEButton) {
      return translate(
        accountInfoTranslationConstants.ageVerificationV2.headingIdvReverificationRequired,
      );
    }
    if (eligibleForAgeVerificationUndo && idvAvailable) {
      return translate(accountInfoTranslationConstants.ageVerificationV2.ageCheckUndoBannerHeading);
    }
    if (eligibleForAgeVerificationUndo && !idvAvailable) {
      return translate(
        accountInfoTranslationConstants.ageVerificationV2.birthdayVerificationUndoBannerHeading,
      );
    }
    if (idvAvailable && !showFAEButton) {
      return translate(accountInfoTranslationConstants.ageVerificationV2.headingIdvOnly);
    }
    return translate(accountInfoTranslationConstants.ageVerificationV2.heading);
  }, [
    showFAEButton,
    idvAvailable,
    requireIDReverification,
    eligibleForAgeVerificationUndo,
    acceptDownageAvailable,
    isU5PendingDownage,
    ageGroup,
    translate,
  ]);

  const getDescription = useMemo(() => {
    if (acceptDownageAvailable) {
      const deadlineDate = ageGroup?.ageVerificationDeadline
        ? new Date(ageGroup.ageVerificationDeadline).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })
        : "";
      if (isU5PendingDownage) {
        return `${translate(accountInfoTranslationConstants.ageVerificationV2.acceptDownageU5Description, { Date: deadlineDate })} ${translate(accountInfoTranslationConstants.ageVerificationV2.acceptDownageDescriptionSuffix)}`;
      }
      const estimatedAge = ageGroup?.estimatedAge ?? "";
      return `${translate(
        accountInfoTranslationConstants.ageVerificationV2.acceptDownageDescription,
        {
          estimatedAge,
          deadlineDate,
        },
      )} ${translate(accountInfoTranslationConstants.ageVerificationV2.acceptDownageDescriptionSuffix)}`;
    }
    if (requireIDReverification && !showFAEButton && idvAvailable) {
      return translate(accountInfoTranslationConstants.ageVerificationV2.requireIDReverification);
    }
    if (showFAEButton && idvAvailable && !eligibleForAgeVerificationUndo) {
      return translate(accountInfoTranslationConstants.ageVerificationV2.descriptionFAEIDV);
    }
    if (!showFAEButton && idvAvailable && !eligibleForAgeVerificationUndo) {
      return translate(accountInfoTranslationConstants.ageVerificationV2.redoIDVBannerDescription);
    }
    if (showFAEButton && !idvAvailable && !eligibleForAgeVerificationUndo) {
      return translate(accountInfoTranslationConstants.ageVerificationV2.descriptionFAEOnly);
    }
    if (!showFAEButton && idvAvailable && eligibleForAgeVerificationUndo) {
      return translate(
        accountInfoTranslationConstants.ageVerificationV2.ageCheckUndoBannerDescription,
      );
    }
    if (!showFAEButton && !idvAvailable && eligibleForAgeVerificationUndo) {
      return translate(
        accountInfoTranslationConstants.ageVerificationV2.birthdayVerificationUndoBannerDescription,
      );
    }
    return undefined;
  }, [
    showFAEButton,
    idvAvailable,
    requireIDReverification,
    eligibleForAgeVerificationUndo,
    acceptDownageAvailable,
    isU5PendingDownage,
    ageGroup,
    translate,
  ]);

  useEffect(() => {
    if (showFAEButton) {
      accountInfoPageViewFaeAvailable();
    }
  }, [showFAEButton]);

  const handleAgeVerificationClick = () => {
    if (vpcForFaeAvailableEffective) {
      if (pendingConsentValue) {
        cancelConsentRequestModalService.open();
        return;
      }
      handleVpcForFaeClick();
      return;
    }
    handleFAEClick(eventConstants.sourceAccountInfo);
  };

  const handleAcceptDownageButtonClick = () =>
    handleAcceptDownageClick(translate(commonTranslationConstants.unknownError));

  const resetModalHeadingKey = showIDVButton
    ? accountInfoTranslationConstants.ageVerificationV2.ageCheckUndoModalHeading
    : accountInfoTranslationConstants.ageVerificationV2.birthdayVerificationUndoModalHeading;
  const errorBannerDescriptionKey = showIDVButton
    ? accountInfoTranslationConstants.ageVerificationV2.ageCheckResetErrorBannerDescription
    : accountInfoTranslationConstants.ageVerificationV2
        .birthdayVerificationResetErrorBannerDescription;

  const [resetModal, resetModalService] = useSettingsModal({
    translatedTitle: translate(resetModalHeadingKey),
    translatedBody: translate(
      accountInfoTranslationConstants.ageVerificationV2.ageVerificationUndoModalDescription,
    ),
    translatedActionButtonText: translate(
      accountInfoTranslationConstants.ageVerificationV2.continueAction,
    ),
    translatedSecondaryButtonText: translate(
      accountInfoTranslationConstants.ageVerificationV2.cancelAction,
    ),
    translatedCloseLabel: translate(commonTranslationConstants.modal.closeBtn),
    onAction: () => handleUndoAgeVerificationClick(errorBannerDescriptionKey),
    shouldCloseModalOnSecondaryButton: true,
    closeable: false,
    size: "Small",
  });

  const handleResetButtonClick = () => {
    resetModalService.open();
  };

  if (
    !showFAEButton &&
    !showIDVButton &&
    !eligibleForAgeVerificationUndo &&
    !acceptDownageAvailable
  ) {
    return null;
  }

  const acceptDownageButtonText = translate(
    accountInfoTranslationConstants.ageVerificationV2.acceptDownageButton,
  );

  const idvButtonTextKey =
    acceptDownageAvailable || showFAEButton || eligibleForAgeVerificationUndo
      ? accountInfoTranslationConstants.ageVerificationV2.idvButton
      : accountInfoTranslationConstants.ageVerificationV2.continueAction;
  const faeButtonTextKey = showIDVButton
    ? accountInfoTranslationConstants.ageVerificationV2.faeButton
    : accountInfoTranslationConstants.ageVerificationV2.continueAction;

  return (
    <React.Fragment>
      <div className="age-verification-upsell-banner">
        <div className="age-verification-content">
          <div className="age-verification-text">
            {getHeading && <h3 className="text-title-large">{getHeading}</h3>}
            {getDescription && <div className="text-body-medium">{getDescription}</div>}
          </div>
          <div className="age-verification-buttons">
            <div className="age-verification-button-row">
              {acceptDownageAvailable && !isU5PendingDownage && (
                <Button
                  variant="Emphasis"
                  size="Medium"
                  isDisabled={isAcceptingDownage}
                  onClick={handleAcceptDownageButtonClick}
                  className="age-verification-button"
                >
                  {acceptDownageButtonText}
                </Button>
              )}
              {!acceptDownageAvailable && showFAEButton && (
                <Button
                  variant="Emphasis"
                  size="Medium"
                  onClick={handleAgeVerificationClick}
                  className="age-verification-button"
                >
                  {translate(faeButtonTextKey)}
                </Button>
              )}
              {showIDVButton && (
                <Button
                  variant={
                    (acceptDownageAvailable && !isU5PendingDownage) || showFAEButton
                      ? "Standard"
                      : "Emphasis"
                  }
                  size="Medium"
                  onClick={handleIDVClick}
                  className="age-verification-button"
                >
                  {translate(idvButtonTextKey)}
                </Button>
              )}
              {!acceptDownageAvailable &&
                eligibleForAgeVerificationUndo &&
                undoAgeVerificationAvailable && (
                  <Button
                    variant="Standard"
                    size="Medium"
                    onClick={handleResetButtonClick}
                    className="age-verification-button"
                  >
                    {translate(
                      accountInfoTranslationConstants.ageVerificationV2.resetAgeVerificationAction,
                    )}
                  </Button>
                )}
            </div>
            <div className="age-verification-disclaimer text-caption-small">
              {translate(
                acceptDownageAvailable && !isU5PendingDownage
                  ? accountInfoTranslationConstants.ageVerificationV2.acceptDownageDisclaimer
                  : accountInfoTranslationConstants.ageVerificationV2.disclaimerPersona,
              )}
            </div>
          </div>
        </div>
      </div>
      {errorModal}
      {cancelConsentRequestModal}
      {resetModal}
    </React.Fragment>
  );
};

export default AgeVerificationV2;
