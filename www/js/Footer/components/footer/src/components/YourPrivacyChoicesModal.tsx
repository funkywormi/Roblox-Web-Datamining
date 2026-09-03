import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getUrlWithLocale } from "@rbx/core-scripts/util/url";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { Loading } from "@rbx/core-ui/legacy/react-style-guide";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@rbx/foundation-ui";
import { setGlobalPrivacyControlAsync, getUserSettingsAsync } from "../services/userSettingsApi";
import { featureCheckAsync } from "../services/accessManagementService";
import * as constants from "../constants/YourPrivacyChoicesModalConstants";

// Due to experimental nature, the globalPrivacyControl boolean does not exist in standard Navigator objects.
interface NavigatorWithGPC extends Navigator {
  globalPrivacyControl?: boolean;
}

type ModalData = {
  isGpcDetected: boolean;
  canUserManageAdsSettings: boolean;
  isAdsSellShareDataEnabled: boolean;
};

const YourPrivacyChoicesModal = ({
  showModal,
  onModalClose,
  translate,
  intl,
}: {
  showModal: boolean;
  onModalClose: () => void;
  translate: (key: string, parameters?: Record<string, unknown>) => string;
  intl: { getRobloxLocale: () => string };
}): React.ReactElement => {
  const { data, isLoading, isError } = useQuery<ModalData>({
    queryKey: ["yourPrivacyChoicesModal"],
    queryFn: async (): Promise<ModalData> => {
      const isAuthenticated = authenticatedUser()?.isAuthenticated ?? false;

      // Check GPC signal
      const isGpcDetected = !!(navigator as NavigatorWithGPC).globalPrivacyControl;

      // Force respect GPC if user is authenticated
      if (isAuthenticated) {
        await setGlobalPrivacyControlAsync();
      }

      // Check if user can manage ads settings
      let canUserManageAdsSettings = false;
      if (isAuthenticated) {
        const featureCheckResponse = await featureCheckAsync<{ access: string }>(
          "ShouldShowAdsSettings",
          "account_management/UserSettingsPolicy",
        );
        canUserManageAdsSettings = featureCheckResponse.access === "Granted";
      }

      // Check if ads sell share data is enabled
      let isAdsSellShareDataEnabled = false;
      if (isAuthenticated) {
        const settingsResponse = await getUserSettingsAsync<{ allowSellShareData?: string }>();
        isAdsSellShareDataEnabled = settingsResponse.allowSellShareData === "Enabled";
      }
      return {
        isGpcDetected,
        canUserManageAdsSettings,
        isAdsSellShareDataEnabled,
      };
    },
    enabled: showModal,
    cacheTime: 0,
  });

  const getAdsPreferencesUrl = (locale: string): string => {
    return getUrlWithLocale("/my/account#!/privacy/AdPreferences", locale);
  };

  const getModalTitle = (): React.ReactElement => {
    return isLoading ? (
      <DialogTitle hidden className="text-heading-small">
        {translate(constants.descriptionLoading)}
      </DialogTitle>
    ) : (
      <DialogTitle className="text-heading-small">
        {isError
          ? translate(constants.titleErrorTranslationKey)
          : data.isGpcDetected
            ? translate(constants.titleGpcDetectedTranslationKey)
            : translate(constants.titleNoGpcDetectedTranslationKey)}
      </DialogTitle>
    );
  };

  const getModalDescription = (): React.ReactElement => {
    if (isLoading) {
      return <Loading />;
    }

    const adsPreferencesUrl = getAdsPreferencesUrl(intl.getRobloxLocale());
    const errorMessage = translate(constants.bodyErrorTranslationKey);
    const GpcMissingSettingIneligible = translate(constants.bodyGpcMissingSettingIneligible, {
      lineBreak: constants.lineBreak,
      aTagStart: constants.learnMoreATagStart,
      aTagEnd: constants.aTagEnd,
    });
    const GpcMissingSettingEligible = translate(constants.bodyGpcMissingSettingEligible, {
      lineBreak: constants.lineBreak,
      aTagWithHref: constants.aTagWithHrefStart,
      link: adsPreferencesUrl,
      hrefEnd: constants.getHrefEnd(adsPreferencesUrl),
      aTagEnd: constants.aTagEnd,
    });
    const GpcDetectedSettingEnabledIneligible = translate(
      constants.bodyGpcDetectedSettingEnabledIneligible,
      {
        lineBreak: constants.lineBreak,
        aTagStart: constants.learnMoreATagStart,
        aTagEnd: constants.aTagEnd,
      },
    );
    const GpcDetectedSettingEnabledEligible = translate(
      constants.bodyGpcDetectedSettingEnabledEligible,
      {
        lineBreak: constants.lineBreak,
        aTagWithHref: constants.aTagWithHrefStart,
        link: adsPreferencesUrl,
        hrefEnd: constants.getHrefEnd(adsPreferencesUrl),
        aTagEnd: constants.aTagEnd,
      },
    );
    const GpcDetectedSettingDisabledIneligible = translate(
      constants.bodyGpcDetectedSettingDisabledIneligible,
      {
        lineBreak: constants.lineBreak,
        aTagStart: constants.learnMoreATagStart,
        aTagEnd: constants.aTagEnd,
      },
    );
    const GpcDetectedSettingDisabledEligible = translate(
      constants.bodyGpcDetectedSettingDisabledEligible,
      {
        lineBreak: constants.lineBreak,
        aTagWithHref: constants.aTagWithHrefStart,
        link: adsPreferencesUrl,
        hrefEnd: constants.getHrefEnd(adsPreferencesUrl),
        aTagEnd: constants.aTagEnd,
      },
    );

    const rawHtml = isError
      ? errorMessage
      : data.isGpcDetected
        ? data.isAdsSellShareDataEnabled
          ? data.canUserManageAdsSettings
            ? GpcDetectedSettingEnabledEligible
            : GpcDetectedSettingEnabledIneligible
          : data.canUserManageAdsSettings
            ? GpcDetectedSettingDisabledEligible
            : GpcDetectedSettingDisabledIneligible
        : data.canUserManageAdsSettings
          ? GpcMissingSettingEligible
          : GpcMissingSettingIneligible;

    return <div className="text-body-medium" dangerouslySetInnerHTML={{ __html: rawHtml }} />;
  };

  const getModalContent = (): React.ReactElement => {
    return (
      <React.Fragment>
        <DialogBody>
          {getModalTitle()}
          {getModalDescription()}
        </DialogBody>
        {!isLoading && (
          <DialogFooter className="width-full">
            <Button className="width-full" size="Large" variant="Emphasis" onClick={onModalClose}>
              {translate(constants.actionOk)}
            </Button>
          </DialogFooter>
        )}
      </React.Fragment>
    );
  };

  return (
    <Dialog
      open={showModal}
      onOpenChange={onModalClose}
      size="Small"
      isModal
      hasCloseAffordance
      closeLabel={constants.actionClose}
    >
      <DialogContent>{getModalContent()}</DialogContent>
    </Dialog>
  );
};

export default YourPrivacyChoicesModal;
