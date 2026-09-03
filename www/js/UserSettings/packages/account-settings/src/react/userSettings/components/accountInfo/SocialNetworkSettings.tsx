import React, { useEffect, useState } from "react";
import { useTranslation } from "react-utilities";
import { Button, TextFormField, Loading } from "react-style-guide";
import { QueryStatus } from "@reduxjs/toolkit/query";
import {
  useSettingsInfoModal as useSettingsInfoModalFromPackage,
  UserPrivacyLevel,
  useSnackbar,
} from "@rbx/user-settings";
import { TPromotionChannelsBody } from "../../../../types/accountInformationTypes";
import SettingsSection from "../../../common/components/SettingsSection";
import accountInfoTranslationConstants from "../../constants/contentConstants/accountInfoTranslationConstants";
import StackedUserInput from "../../../common/components/StackedUserInput";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import { useSettingsInfoModal } from "../../../common/hooks/modals/useSettingsModal";
import {
  useGetPromotionChannelsQuery,
  useUpdatePromotionChannelsMutation,
} from "../../../apis/accountInformationApi";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";
import SocialNetworkVisibility from "./SocialNetworkVisibility";

export const useSelectSocialNetworkSettingsProps = (): {
  promotionChannels?: TPromotionChannelsBody;
  promotionChannelQueryStatus: QueryStatus;
  loadingPromotionChannels: boolean;
} => {
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const {
    data: promotionChannels,
    status: promotionChannelQueryStatus,
    isLoading: loadingPromotionChannels,
  } = useGetPromotionChannelsQuery();

  return {
    promotionChannels,
    promotionChannelQueryStatus,
    loadingPromotionChannels,
  };
};

export const SocialNetworksSettings = (): JSX.Element => {
  const [socialNetworksVisibilityPrivacy, setSocialNetworksVisibilityPrivacy] = useState<
    UserPrivacyLevel | undefined
  >();
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const { socialNetworks } = accountInfoTranslationConstants;
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();

  const { promotionChannels, promotionChannelQueryStatus, loadingPromotionChannels } =
    useSelectSocialNetworkSettingsProps();
  const [updatePromotionChannels] = useUpdatePromotionChannelsMutation();

  const [facebookUrl, setFacebookUrl] = useState<string>();
  const [twitterUrl, setTwitterUrl] = useState<string>();
  const [youtubeUrl, setYoutubeUrl] = useState<string>();
  const [twitchUrl, setTwitchUrl] = useState<string>();
  const [guildedUrl, setGuildedUrl] = useState<string>();

  const [statusModalBodyTranslationKey, setStatusModalBodyTranslationKey] = useState(
    commonTranslationConstants.modal.error.body,
  );
  const [statusModalTitleTranslationKey, setStatusModalTitleTranslationKey] = useState(
    commonTranslationConstants.modal.error.title,
  );

  const enableFoundationModals = uiPolicy?.enableFoundationModals ?? false;
  const disableSocialLinkCreation = uiPolicy?.disableSocialLinkCreation ?? false;
  const enforceAgeVerificationForSocialLinks =
    uiPolicy?.enforceAgeVerificationForSocialLinks ?? false;

  const [statusModalV1, statusModalServiceV1] = useSettingsInfoModal(
    statusModalTitleTranslationKey,
    statusModalBodyTranslationKey,
  );

  const [statusModalV2, statusModalServiceV2] = useSettingsInfoModalFromPackage(
    translate(statusModalTitleTranslationKey),
    translate(statusModalBodyTranslationKey),
    translate(commonTranslationConstants.modal.submitButtonText),
    translate(commonTranslationConstants.modal.closeBtn),
  );

  const statusModal = enableFoundationModals ? statusModalV2 : statusModalV1;
  const statusModalService = enableFoundationModals ? statusModalServiceV2 : statusModalServiceV1;

  useEffect(() => {
    switch (promotionChannelQueryStatus) {
      case QueryStatus.fulfilled:
        // Because state initialization is only evaluated on mount
        // useState(promotionChannels?.facebook) doesn't work
        setFacebookUrl(promotionChannels?.facebook ?? "");
        setTwitterUrl(promotionChannels?.twitter ?? "");
        setYoutubeUrl(promotionChannels?.youtube ?? "");
        setTwitchUrl(promotionChannels?.twitch ?? "");
        setGuildedUrl(promotionChannels?.guilded ?? "");
        setSocialNetworksVisibilityPrivacy(promotionChannels?.promotionChannelsVisibilityPrivacy);
        break;
      case QueryStatus.rejected:
        snackbarService.warning(translate(commonTranslationConstants.unknownError));
        break;
      default:
      // do nothing
    }
  }, [promotionChannels, promotionChannelQueryStatus]);

  const savePromotionChannels = async (): Promise<void> => {
    try {
      const body: TPromotionChannelsBody = {
        promotionChannelsVisibilityPrivacy: socialNetworksVisibilityPrivacy,
        facebook: facebookUrl,
        twitter: twitterUrl,
        youtube: youtubeUrl,
        twitch: twitchUrl,
        guilded: guildedUrl,
      };
      await updatePromotionChannels(body).unwrap();
      setStatusModalTitleTranslationKey(commonTranslationConstants.modal.success.title);
      setStatusModalBodyTranslationKey(commonTranslationConstants.modal.success.body);
      statusModalService.open();
    } catch (error) {
      setStatusModalTitleTranslationKey(commonTranslationConstants.modal.error.title);
      setStatusModalBodyTranslationKey(error as string);
      statusModalService.open();
    }
  };

  return (
    <React.Fragment>
      {enforceAgeVerificationForSocialLinks && (
        <SettingsSection
          title={translate(socialNetworks.socialNetworksVisibility)}
          description={translate(socialNetworks.socialNetworksDescription)}
        >
          <SocialNetworkVisibility />
        </SettingsSection>
      )}
      <SettingsSection
        title={translate(accountInfoTranslationConstants.headings.socialNetworks)}
        description={
          disableSocialLinkCreation ? translate(socialNetworks.manageLinksRequirement) : undefined
        }
      >
        {loadingPromotionChannels ? (
          <Loading />
        ) : (
          <React.Fragment>
            <div className="social-networks-container">
              <StackedUserInput inputId="facebook" label={translate(socialNetworks.facebookLabel)}>
                <TextFormField
                  disabled={disableSocialLinkCreation}
                  placeholder={translate(socialNetworks.facebookExample)}
                  value={facebookUrl}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setFacebookUrl(event.target.value)
                  }
                />
              </StackedUserInput>
              <StackedUserInput inputId="twitter" label={translate(socialNetworks.twitterLabel)}>
                <TextFormField
                  disabled={disableSocialLinkCreation}
                  placeholder={translate(socialNetworks.twitterExample)}
                  value={twitterUrl}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setTwitterUrl(event.target.value)
                  }
                />
              </StackedUserInput>
              <StackedUserInput inputId="youtube" label={translate(socialNetworks.youtubeLabel)}>
                <TextFormField
                  disabled={disableSocialLinkCreation}
                  placeholder={translate(socialNetworks.youtubeExample)}
                  value={youtubeUrl}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setYoutubeUrl(event.target.value)
                  }
                />
              </StackedUserInput>
              <StackedUserInput inputId="twitch" label={translate(socialNetworks.twitchLabel)}>
                <TextFormField
                  disabled={disableSocialLinkCreation}
                  placeholder={translate(socialNetworks.twitchExample)}
                  value={twitchUrl}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setTwitchUrl(event.target.value)
                  }
                />
              </StackedUserInput>
              <Button
                id="save-social-settings"
                isDisabled={disableSocialLinkCreation}
                size={Button.sizes.small}
                variant={Button.variants.control}
                onClick={savePromotionChannels}
              >
                {translate(commonTranslationConstants.saveAction)}
              </Button>
            </div>

            {!enforceAgeVerificationForSocialLinks && (
              <SettingsSection
                title={translate(socialNetworks.socialNetworksVisibility)}
                description={translate(socialNetworks.socialNetworksDescription)}
              >
                {/* Social links visibility radio button version */}
                <SocialNetworkVisibility />
              </SettingsSection>
            )}
          </React.Fragment>
        )}
      </SettingsSection>
      {statusModal}
    </React.Fragment>
  );
};

export default SocialNetworksSettings;
