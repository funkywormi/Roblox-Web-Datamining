import { useTranslation } from "react-utilities";
import React from "react";
import { Button } from "react-style-guide";
import { AccessManagementUpsellV2Service } from "Roblox";
import verificationEventService from "../../services/eventServices/verificationEventService";
import CollapsibleUserInput from "../../../common/components/CollapsibleUserInput";
import { birthdateMoreInfo } from "../../constants/urlConstants";
import accountInfoTranslationConstants from "../../constants/contentConstants/accountInfoTranslationConstants";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import { useSettingsInfoModal } from "../../../common/hooks/modals/useSettingsModal";
import { useAppDispatch } from "../../../redux/hooks";
import ApiCacheTag from "../../../apis/common/cacheTagEnum";
import { useGetVerifiedAgeQuery } from "../../../apis/ageVerificationApi";
import baseApi from "../../../apis/common/baseApi";
import { accountSettingsEntry } from "../../constants/accountInfo/accountInfoConstants";
import AMPFeaturesConstants from "../../constants/AMPFeaturesConstants";

const { verifyAgeDialog: VerifyAgeDialog, verifyAgeConsent: VerifyAgeConsent } =
  accountInfoTranslationConstants.ageVerification;

const AgeVerification = (): JSX.Element => {
  const { data: verifiedAge } = useGetVerifiedAgeQuery();
  const dispatch = useAppDispatch();
  const { translate } = useTranslation();

  const [errorModal, errorModalService] = useSettingsInfoModal(
    commonTranslationConstants.modal.error.title,
    commonTranslationConstants.modal.error.body,
  );
  const invalidateCachedData = () => {
    const invalidCacheTags = [
      ApiCacheTag.Birthdate,
      ApiCacheTag.AccountInfo,
      ApiCacheTag.VerifiedAge,
      ApiCacheTag.AccountInfoAgeVerificationPolicy,
    ];
    const invalidateAction = baseApi.util.invalidateTags(invalidCacheTags);
    dispatch(invalidateAction);
  };

  const handleVerifyButtonClicked = () => {
    verificationEventService.verifyAgeButtonClicked();
    const ageVerificationFeatureParams = {
      featureName: AMPFeaturesConstants.ageVerificationAMPFeature,
    };
    AccessManagementUpsellV2Service.startAccessManagementUpsell(ageVerificationFeatureParams)
      .catch(() => errorModalService.open())
      .finally(() => invalidateCachedData());
  };

  const getUnverifiedDescription = () => {
    const unVerifiedDescription = translate(VerifyAgeConsent, {
      linkStart: `<b><a className='text-link' href=${birthdateMoreInfo}>`,
      linkEnd: "</a></b>",
    });
    return (
      <span
        data-testid={VerifyAgeConsent.toLowerCase()}
        dangerouslySetInnerHTML={{ __html: unVerifiedDescription }}
      />
    );
  };

  return (
    <React.Fragment>
      {!verifiedAge?.isVerified && (
        <CollapsibleUserInput inputId="id-verification">
          <div>
            <Button
              className="verify-identity-button btn-control-sm acct-settings-btn verify-age-btn"
              size={Button.sizes.large}
              width={Button.widths.full}
              onClick={handleVerifyButtonClicked}
              isDisabled={verifiedAge?.isVerified}
              data-testid="verify-age-btn"
            >
              <span>{translate(VerifyAgeDialog)}</span>
              {verifiedAge?.isVerified && <span className="icon-checkmark-16x16" />}
            </Button>
            <span className="verify-legal-text">
              <span className="small text account-more-info">
                {!verifiedAge?.isVerified && getUnverifiedDescription()}
              </span>
            </span>
          </div>
        </CollapsibleUserInput>
      )}
      {errorModal}
      <div id="id-verification-container" {...accountSettingsEntry} />
    </React.Fragment>
  );
};

export default AgeVerification;
