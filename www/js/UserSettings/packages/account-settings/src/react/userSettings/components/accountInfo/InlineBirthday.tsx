import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-utilities";
import { Badge } from "@rbx/foundation-ui";
import { ParentConsentType, ParentConsentSettingName } from "../../../../types/parentConsentsTypes";
import SettingsTextField from "../../../common/components/SettingsTextField";
import { useGetAccountInfoQuery } from "../../../apis/legacyAccountSettingsApi";
import { useGetBirthdateQuery } from "../../../apis/usersApi";
import useChangeBirthdateModal from "../../../common/hooks/modals/useChangeBirthdateModal";
import accountInfoTranslationConstants from "../../constants/contentConstants/accountInfoTranslationConstants";
import birthdayUtils from "../../utils/birthdayUtils";
import { useGetVerifiedAgeQuery } from "../../../apis/ageVerificationApi";
import { clearParentConsentCooldown } from "../../utils/parentalControls/parentalConsentUtils";
import accountInfoEventService from "../../services/eventServices/accountInfoEventService";
import useGetPendingParentalConsentRequest from "../../hooks/useGetPendingParentalConsentRequest";
import useCancelConsentRequestModal from "../../../common/hooks/modals/useCancelConsentRequestModal";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import { birthdateUpdateHelpArticle } from "../../constants/urlConstants";
import { minimumValidAge } from "../../constants/accountInfo/accountInfoConstants";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";

const { birthdate: birthdateTranslation } = accountInfoTranslationConstants;

export const InlineBirthday = (): JSX.Element => {
  const { translate } = useTranslation();

  const { data: accountInfo, isLoading } = useGetAccountInfoQuery();
  const { data: birthdate } = useGetBirthdateQuery();
  const { data: verifiedAge } = useGetVerifiedAgeQuery();
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();

  useEffect(() => {
    if (verifiedAge && accountInfo) {
      accountInfoEventService.authPageLoad(verifiedAge.isVerified, accountInfo.UserAbove13);
    }
  }, [verifiedAge, accountInfo]);
  const pendingBirthdateConsent = useGetPendingParentalConsentRequest(
    ParentConsentType.UpdateBirthdate,
  );

  const [changeAgeModal, changeAgeModalService] = useChangeBirthdateModal();

  const [cancelPendingConsentModal, cancelPendingConsentModalService] =
    useCancelConsentRequestModal({
      pendingConsent: pendingBirthdateConsent,
      translatedBody: (
        <p
          dangerouslySetInnerHTML={{
            __html: translate(birthdateTranslation.pendingConsent.body, {
              newBirthday: birthdayUtils.formatBirthdateFromISO(
                pendingBirthdateConsent?.consentData?.newBirthdate ?? "",
              ),
            }),
          }}
        />
      ),
      onSuccess: () => clearParentConsentCooldown(ParentConsentSettingName.NewBirthdate),
    });

  const changeBirthday = () => {
    if (pendingBirthdateConsent) {
      cancelPendingConsentModalService.open();
      accountInfoEventService.cancelPendingConsentModalLoad(
        verifiedAge?.isVerified ?? false,
        accountInfo?.UserAbove13 ?? false,
      );
    } else {
      accountInfoEventService.birthdayUpdateModalLoad(
        verifiedAge?.isVerified ?? false,
        accountInfo?.UserAbove13 ?? false,
      );
      changeAgeModalService.open();

      accountInfoEventService.birthdayUpdateBtnClick(
        verifiedAge?.isVerified ?? false,
        accountInfo?.UserAbove13 ?? false,
      );
    }
  };
  const ageVerifiedMetadata = (
    <Badge
      icon="icon-filled-circle-check"
      label={translate(birthdateTranslation.verifiedLabel)}
      variant="Neutral"
      className="age-checked-badge"
    />
  );

  const age = birthdayUtils.calculateAge(birthdate);
  const hasOldEnoughBirthday = age >= minimumValidAge;
  const formattedBirthdate = birthdayUtils.isValidBirthdate(birthdate)
    ? birthdayUtils.formatBirthdate(birthdate)
    : "";

  const birthdateMetadata = useMemo(() => {
    if (pendingBirthdateConsent) {
      return (
        <div className="inline-badge">
          <Badge
            variant="Neutral"
            icon="icon-regular-clock"
            label={translate(birthdateTranslation.pendingUpdateMessage)}
          />
        </div>
      );
    }
    if (verifiedAge?.isVerified) {
      return ageVerifiedMetadata;
    }

    if (!hasOldEnoughBirthday) {
      return (
        <span className="text-body-medium" data-testid="u5-message">
          {translate(birthdateTranslation.addBirthdayMessage)}
          &nbsp;
          <a
            className="text-link"
            href={birthdateUpdateHelpArticle}
            target="_blank"
            rel="noreferrer"
          >
            {translate(commonTranslationConstants.learnMore)}
          </a>
        </span>
      );
    }
    if (uiPolicy?.displayVPCAgeVerifiedMetadata && uiPolicy?.enableVPCBirthdateUpdateLifetimeCap) {
      return (
        <Badge
          icon="icon-filled-circle-check"
          label={translate(birthdateTranslation.birthdateSetByYourParentDescription)}
          variant="Neutral"
          className="age-checked-badge"
        />
      );
    }
    return null;
  }, [pendingBirthdateConsent, verifiedAge, birthdate]);

  return (
    <React.Fragment>
      {!isLoading && (
        <SettingsTextField
          id="account-field-username"
          primaryEditLabel={translate(
            hasOldEnoughBirthday
              ? birthdateTranslation.changeBirthday
              : commonTranslationConstants.addAction,
          )}
          label={translate(birthdateTranslation.label)}
          valueSet={hasOldEnoughBirthday}
          lines={[{ value: formattedBirthdate, metadataBody: birthdateMetadata }]}
          primaryOnEdit={changeBirthday}
          displayEditButton={!verifiedAge?.isVerified}
        />
      )}
      {changeAgeModal}
      {cancelPendingConsentModal}
    </React.Fragment>
  );
};

export default InlineBirthday;
