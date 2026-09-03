import { useCallback } from "react";
import { MediaType } from "../../challenge/twoStepVerification";
import { SecurityTabResources } from "../constants/resources";
import * as MyAccountApiTypes from "../../../common/request/types/myAccount";
import * as TwoStepVerificationApiTypes from "../../../common/request/types/twoStepVerification";
import useSecurityTabContext from "../hooks/useSecurityTabContext";

type OptionContent = {
  title: string;
  description: string;
};

export type TwoStepVerificationStateReturn = {
  resources: SecurityTabResources;
  enabledMediaTypes: MediaType[];
  twoStepVerificationMetadata: TwoStepVerificationApiTypes.GetMetadataReturnType;
  mySettingsInfo: MyAccountApiTypes.GetMySettingsInfoReturnType | null;

  isEmailVerified: () => boolean;
  getUserEmail: () => string;

  // Computed State
  selectedOption: MediaType;
  getOptionContent: (mediaType: MediaType) => OptionContent;
};

const useTwoStepVerificationState = (): TwoStepVerificationStateReturn => {
  const { state } = useSecurityTabContext();
  const { resources, enabledMediaTypes, mySettingsInfo, twoStepVerificationMetadata } = state;

  // Helper functions that use security tab context to verify different states
  const isEmailVerified = useCallback(
    () => mySettingsInfo !== null && mySettingsInfo.IsEmailOnFile && mySettingsInfo.IsEmailVerified,
    [mySettingsInfo],
  );

  const getUserEmail = useCallback(() => mySettingsInfo?.UserEmail || "", [mySettingsInfo]);

  // Selection logic for radio button should prioritize by security level (security key > authenticator > email)
  const getSelectedOption = useCallback((): MediaType => {
    if (enabledMediaTypes.includes(MediaType.SecurityKey)) {
      return MediaType.SecurityKey;
    }
    if (enabledMediaTypes.includes(MediaType.Authenticator)) {
      return MediaType.Authenticator;
    }
    if (enabledMediaTypes.includes(MediaType.Email)) {
      return MediaType.Email;
    }
    return MediaType.None;
  }, [enabledMediaTypes]);

  // Show translation keys based on media type
  const getOptionContent = useCallback(
    (mediaType: MediaType): OptionContent => {
      const isEnabled = enabledMediaTypes.includes(mediaType);

      switch (mediaType) {
        case MediaType.None:
          return {
            title: resources.Label.None,
            description: resources.Label.NoneDescriptionNew,
          };
        case MediaType.Authenticator:
          return {
            title: resources.Label.AuthenticatorTwoStepVerificationCodes,
            description: isEnabled
              ? resources.Label.AuthenticatorHelpText
              : resources.Label.AuthenticatorDisabledHelpText,
          };
        case MediaType.Email:
          return {
            title: resources.Label.EmailTwoStepVerificationCodes,
            description: isEnabled
              ? resources.Description.TwoStepVerificationSecondaryEnabled(getUserEmail())
              : resources.Label.TwoStepPrerequisite,
          };
        case MediaType.SecurityKey:
          return {
            title: resources.Heading.SecurityKey.SecurityKey2,
            description: resources.Label.SecurityKey.SecurityKeyAndAuthenticator,
          };
        default:
          return {
            title: "",
            description: "",
          };
      }
    },
    [enabledMediaTypes, resources, getUserEmail],
  );

  return {
    // Raw State
    resources,
    enabledMediaTypes: enabledMediaTypes as MediaType[],
    twoStepVerificationMetadata,
    mySettingsInfo,

    // Helper Functions
    isEmailVerified,
    getUserEmail,

    // Computed State
    selectedOption: getSelectedOption(),
    getOptionContent,
  };
};

export default useTwoStepVerificationState;
