import { AccountIntegrityChallengeService } from "Roblox";
import * as TwoStepVerificationApiTypes from "../../../common/request/types/twoStepVerification";
import * as MyAccountApiTypes from "../../../common/request/types/myAccount";
import * as PhoneApiTypes from "../../../common/request/types/phone";
import * as AuthApiTypes from "../../../common/request/types/auth";
import * as UserSettingApiTypes from "../../../common/request/types/userSettings";
import { ModalStateAndProps } from "../constants/types";
import { MediaType } from "../../challenge/twoStepVerification";

export enum SecurityTabActionType {
  INITIALIZE_MY_SETTINGS_INFO,
  INITIALIZE_TWO_STEP_VERIFICATION,
  SET_PASSKEY_INFO,
  INITIALIZE_USER_SETTINGS,
  SET_PHONE_CONFIGURATION,
  SET_MODAL_STATE,
  ENABLE_MEDIA_TYPE,
  DISABLE_MEDIA_TYPE,
  SET_RECOVERY_CODE_STATUS,
  SET_HAS_CONNECTED_XBOX_ACCOUNT,
  SET_HAS_CONNECTED_PLAYSTATION_ACCOUNT,
  SET_ROBUX_SPEND_FRICTION_STATUS,
}

export type SecurityTabAction =
  | {
      type: SecurityTabActionType.INITIALIZE_MY_SETTINGS_INFO;
      mySettingsInfo: MyAccountApiTypes.GetMySettingsInfoReturnType;
    }
  | {
      type: SecurityTabActionType.INITIALIZE_TWO_STEP_VERIFICATION;
      metadata: TwoStepVerificationApiTypes.GetMetadataReturnType;
      enabledMediaTypes: string[];
    }
  | {
      type: SecurityTabActionType.SET_PHONE_CONFIGURATION;
      phoneConfiguration: PhoneApiTypes.GetPhoneConfigurationReturnType;
    }
  | ({
      type: SecurityTabActionType.SET_MODAL_STATE;
    } & ModalStateAndProps)
  | {
      type: SecurityTabActionType.ENABLE_MEDIA_TYPE;
      mediaType: MediaType;
    }
  | {
      type: SecurityTabActionType.DISABLE_MEDIA_TYPE;
      mediaType: MediaType;
    }
  | {
      type: SecurityTabActionType.SET_RECOVERY_CODE_STATUS;
      recoveryCodeStatus: TwoStepVerificationApiTypes.GetRecoveryCodesStatusReturnType;
    }
  | {
      type: SecurityTabActionType.SET_HAS_CONNECTED_XBOX_ACCOUNT;
      hasConnectedXboxAccount: boolean;
    }
  | {
      type: SecurityTabActionType.SET_HAS_CONNECTED_PLAYSTATION_ACCOUNT;
      hasConnectedPlaystationAccount: boolean;
    }
  | {
      type: SecurityTabActionType.SET_ROBUX_SPEND_FRICTION_STATUS;
      showRobuxSpendFriction: boolean;
      robuxSpendFrictionMessage: string;
      twoStepVerificationActionType: AccountIntegrityChallengeService.TwoStepVerification.ActionType | null;
    }
  | {
      type: SecurityTabActionType.SET_PASSKEY_INFO;
      credentialsList: AuthApiTypes.ListCredentialsReturnType;
      isPasskeySupported: boolean;
    }
  | {
      type: SecurityTabActionType.INITIALIZE_USER_SETTINGS;
      userSettings: UserSettingApiTypes.UserSettingsReturnType;
    };
