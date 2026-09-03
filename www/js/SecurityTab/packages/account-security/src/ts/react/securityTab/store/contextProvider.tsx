import React, {
  createContext,
  ReactChild,
  ReactElement,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { createSystemFeedback } from "react-style-guide";
import { TranslateFunction } from "react-utilities";
import { useQuery } from "@tanstack/react-query";
import { hybridResponseService } from "core-roblox-utilities";
import { DeviceMeta } from "Roblox";
import { RequestService } from "../../../common/request";
import { getPersonalizedResources } from "../constants/resources";
import { EventService } from "../services/eventService";
import { ChallengeParamData } from "../utils/challengeParamData";
import { SecurityTabAction, SecurityTabActionType } from "./action";
import ModalState from "./modalState";
import { SecurityTabState } from "./state";
import securityTabStateReducer from "./stateReducer";
import { isPasskeyCompatible } from "../../common/compatibility";

export type SecurityTabContext = {
  state: SecurityTabState;
  dispatch: React.Dispatch<SecurityTabAction>;
};

/**
 * A React `Context` is global state maintained for some subtree of the React
 * component hierarchy. This particular context is used for the entire
 * `securityTab` web app, containing both the app's state as well
 * as a function to dispatch actions on the state.
 */
export const SecurityTabContext = createContext<SecurityTabContext | null>(
  // The argument passed to `createContext` is supposed to define a default
  // value that gets used if no provider is available in the component tree at
  // the time that `useContext` is called. To avoid runtime errors as a result
  // of forgetting to wrap a subtree with a provider, we use `null` as the
  // default value and test for it whenever global state is accessed.
  null,
);

type Props = {
  eventService: EventService;
  requestService: RequestService;
  translate: TranslateFunction;
  children: ReactChild;
  isUnder13: boolean;
  challengeParamData: ChallengeParamData | null;
};

/**
 * A React provider is a special component that wraps a tree of components and
 * exposes some global state (context) to the entire tree. Descendants can then
 * access this context with `useContext`.
 */
export const SecurityTabContextProvider = ({
  eventService,
  requestService,
  translate,
  children,
  isUnder13,
  challengeParamData,
}: Props): ReactElement => {
  const [SystemFeedback, systemFeedbackService] = createSystemFeedback();

  const resources = useMemo(
    () => getPersonalizedResources(translate, isUnder13),
    [translate, isUnder13],
  );

  /**
   * Queries. Start using these instead of network call + useEffect from now on.
   */

  const { data: phoneConfigurationData, refetch: refetchPhoneConfiguration } = useQuery({
    queryKey: ["phoneConfiguration"],
    queryFn: requestService.phone.getPhoneConfiguration,
    initialData: null,
  });

  const { data: mySettingsInfoData, refetch: refetchSettings } = useQuery({
    queryKey: ["mySettingsInfo"],
    queryFn: requestService.myAccount.getMySettingsInfo,
  });

  const { data: credentialsListData, refetch: refetchCredentials } = useQuery({
    queryKey: ["credentialsList"],
    queryFn: () =>
      requestService.authApi.listAllCredentials({
        // Skips security keys.
        all: false,
      }),
    initialData: null,
  });

  const [initialState] = useState<SecurityTabState>(() => ({
    // Immutable state:
    resources,
    eventService,
    requestService,
    systemFeedbackService,
    SystemFeedback,
    refetchPhoneConfiguration,
    refetchSettings,
    refetchCredentials,

    // Mutable state:
    mySettingsInfo: null,
    hasConnectedXboxAccount: false,
    hasConnectedPlaystationAccount: false,
    phoneConfiguration: null,
    recoveryCodeStatus: {
      activeCount: 0,
      created: null,
    },
    twoStepVerificationMetadata: {
      authenticatorHelpSiteAddress: "",
      twoStepVerificationEnabled: false,
      authenticatorEnabled: false,
      authenticatorQrCodeSize: "",
      emailCodeLength: 0,
      authenticatorCodeLength: 0,
      isAuthenticatorWithVerifiedPhoneEnabled: false,
      isSecurityKeyOnAllPlatformsEnabled: false,
      isSingleMethodEnforcementEnabled: false,
      isRecoveryCodeGenerationForAuthenticatorSetupEnabled: false,
      receiveWarningsOnDisableTwoStep: false,
      isSmsTwoStepVerificationAvailable: false,
      isSecurityKeyTwoStepVerificationAvailable: false,
      isAndroidSecurityKeyEnabled: false,
      isSettingsTabRedesignEnabled: false,
      isEppUIEnabled: false,
      twoStepCopyTextEnrollmentStatus: 0,
      isUserU13: false,
      maskedUserEmail: "",
      isDelayedUiEnabled: false,
      is2svRecoveryEnabled: false,
      isEppRecoveryCodesEnabled: false,
    },
    credentialsList: null,
    isPasskeySupported: null,
    userSettings: null,
    showRobuxSpendFriction: false,
    robuxSpendFrictionMessage: "",
    twoStepVerificationActionType: null,
    enabledMediaTypes: [],
    modalStateAndProps: { modalState: ModalState.NONE, additionalModalProps: null },
    challengeParamData,
  }));

  // Components will access and mutate state via these variables:
  const [state, dispatch] = useReducer(securityTabStateReducer, initialState);

  // UseEffect because our return values very slightly have the wrong shape for our context.
  useEffect(() => {
    const dispatchResults = async () => {
      if (!mySettingsInfoData?.isError && mySettingsInfoData?.value) {
        dispatch({
          type: SecurityTabActionType.INITIALIZE_MY_SETTINGS_INFO,
          mySettingsInfo: mySettingsInfoData?.value,
        });
      }
      if (!phoneConfigurationData?.isError && phoneConfigurationData?.value) {
        dispatch({
          type: SecurityTabActionType.SET_PHONE_CONFIGURATION,
          phoneConfiguration: phoneConfigurationData.value,
        });
      }
      if (!credentialsListData?.isError && credentialsListData?.value) {
        dispatch({
          type: SecurityTabActionType.SET_PASSKEY_INFO,
          credentialsList: credentialsListData.value,
          isPasskeySupported: await isPasskeyCompatible({
            producer: DeviceMeta,
            hybridCallback: () =>
              hybridResponseService.getNativeResponse(
                hybridResponseService.FeatureTarget.CREDENTIALS_PROTOCOL_AVAILABLE,
                {},
                10000,
              ),
          }),
        });
      }
    };
    // eslint-disable-next-line no-void
    void dispatchResults();
  }, [mySettingsInfoData, phoneConfigurationData, credentialsListData]);

  return (
    <SecurityTabContext.Provider value={{ state, dispatch }}>
      {children}
    </SecurityTabContext.Provider>
  );
};
