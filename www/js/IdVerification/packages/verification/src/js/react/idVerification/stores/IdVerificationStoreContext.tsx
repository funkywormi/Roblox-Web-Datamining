import React, { createContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import { EnvironmentUrls } from '@rbx/environment-urls';
import { window as browserWindow } from '@rbx/core-lib/browser';
import { isAuthenticated, isUnder13 } from '@rbx/core-scripts/meta/user';
import {
  SET_USER_EMAIL_STATES,
  SET_PAGENAME_STATE,
  SET_MODAL_STATES,
  SET_INPUT_STATE,
  SET_ERROR_STATE,
  SET_EMAIL_UPDATING_STATE,
  SET_TRIGGER_ORIGIN,
  SET_INPUT_CLEAR,
  SET_VERIFICATION_CALLBACK,
  SET_CALLBACK_READY,
  CLEANUP_MODAL
} from '../actions/actionTypes';
import { buttonVariants } from '../constants/buttonConstants';
import type { ButtonInfo } from '../constants/buttonConstants';
import emailUpsellConstants from '../constants/emailUpsellConstants';
import { DisplayView, CloseVendorModalEvent } from '../constants/viewConstants';
import type { DisplayViewName } from '../constants/viewConstants';
import events from '../constants/idVerificationEventStreamConstants';
import { sendIdVerificationEvent } from '../services/ageVerificationServices';
import type { VerificationSuccessCallback } from '../services/ageVerificationServices';
import {
  postOptUserInToVoiceChat,
  postOptUserInToAvatarChat,
  sendChatEvent
} from '../services/voiceChatService';

const { websiteUrl } = EnvironmentUrls;

const {
  ActionGenericSkip,
  ActionChangeEmail,
  ActionContinue,
  DescriptionAddEmailTextOver13,
  DescriptionAddEmailTextUnder13,
  HeadingAddEmail,
  LabelEmailInputPlaceholderOver13,
  LabelEmailInputPlaceholderUnder13
} = emailUpsellConstants;

export type ViewTemplatePageState = {
  heading: string;
  icon?: string;
  bodyText: string[];
  buttonStack: ButtonInfo[];
  errorState?: boolean;
  footerText?: string;
  userEmail?: string | null;
  daysUntilNextVerification?: number;
  canClose?: boolean;
  displayCheckbox?: boolean;
};

export type VendorLinkPageState = {
  verificationLink: string;
  useQRCode?: boolean;
  origin: string;
  redirectUrl: string;
};

export type VoiceUpsellKeys = {
  heading: string;
  enableVoiceChat: string;
  followCommunityStandards: string;
  implicitConsent: string;
  explicitConsent: string;
  learnMoreAboutVoiceRecording: string;
  buttonStack: ButtonInfo[];
};

export type VoiceUpsellPageState = {
  communityStandardsUrl: string;
  voiceFAQUrl: string;
  requireExplicitVoiceConsent?: boolean;
  useVoiceUpsellV2Design?: boolean;
  voiceUpsellV1Keys: VoiceUpsellKeys;
  voiceUpsellV2Keys: VoiceUpsellKeys;
};

export type CameraUpsellPageState = {
  title: string;
  animateYourAvatar: string;
  communityStandards: string;
  cameraPrivacy: string;
  implicitConsent: string;
  explicitConsent: string;
  learnMore: string;
  facialPrivacyUrl: string;
  requireExplicitCameraConsent: boolean;
  useCameraU13Design: boolean;
  buttons: ButtonInfo[];
};

type PageAction<P, Fields = object> = {
  type: typeof SET_PAGENAME_STATE;
  pageName: P;
  dispatch: IdVerificationDispatch;
} & Fields;

export type PollingPageState = PageAction<
  typeof DisplayView.POLLING,
  {
    origin: string;
    verificationLink: string;
    useQRCode?: boolean;
    checklistStep: number;
  }
>;

type SetPageNameAction =
  | PageAction<
      | typeof DisplayView.SUCCESS_OVERAGE
      | typeof DisplayView.SUCCESS_UNDERAGE
      | typeof DisplayView.SUCCESS_GENERIC
      | typeof DisplayView.PENDING
      | typeof DisplayView.FAILURE
      | typeof DisplayView.ERROR,
      { close: () => void; textKey?: string | null; isSeventeenPlus?: boolean }
    >
  | PageAction<typeof DisplayView.EXTERNAL_EMAIL | typeof DisplayView.EMAIL_CONTINUE, { poll: () => void }>
  | PollingPageState
  | { type: typeof SET_PAGENAME_STATE; pageName: typeof DisplayView.POLLING }
  | PageAction<typeof DisplayView.LANDING, { continue: () => void }>
  | PageAction<typeof DisplayView.TEMP_BAN, { close: () => void; daysUntilNextVerification: number }>
  | PageAction<
      typeof DisplayView.VENDOR_LINK,
      { verificationLink: string; useQRCode?: boolean; redirectUrl: string }
    >
  | PageAction<
      typeof DisplayView.ENABLE_VOICE_CHAT,
      { close: () => void; requireExplicitVoiceConsent?: boolean; useVoiceUpsellV2Design?: boolean }
    >
  | PageAction<
      typeof DisplayView.ENABLE_AVATAR_CHAT,
      { close: () => void; requireExplicitCameraConsent: boolean; useCameraU13Design: boolean }
    >
  | PageAction<typeof DisplayView.EMAIL>;

export type IdVerificationAction =
  | { type: typeof SET_INPUT_CLEAR }
  | { type: typeof SET_TRIGGER_ORIGIN; origin: string; skipCallback: (() => void) | false | null }
  | { type: typeof SET_USER_EMAIL_STATES; isEmailVerified?: boolean; userEmail?: string | null }
  | SetPageNameAction
  | { type: typeof SET_ERROR_STATE; errorMsg: string | undefined }
  | { type: typeof SET_EMAIL_UPDATING_STATE; isEmailUpdating: boolean }
  | { type: typeof SET_INPUT_STATE; pageName: DisplayViewName; value: string }
  | { type: typeof SET_MODAL_STATES }
  | { type: typeof SET_VERIFICATION_CALLBACK; callback: VerificationSuccessCallback | undefined }
  | { type: typeof SET_CALLBACK_READY }
  | { type: typeof CLEANUP_MODAL };

export type PageState =
  | ViewTemplatePageState
  | VendorLinkPageState
  | PollingPageState
  | { type: typeof SET_PAGENAME_STATE; pageName: typeof DisplayView.POLLING }
  | VoiceUpsellPageState
  | CameraUpsellPageState;

export type IdVerificationState = {
  pageName: DisplayViewName;
  isEmailVerified?: boolean;
  isEmailSent: boolean;
  isEmailUpdating: boolean;
  origin: string;
  userEmail?: string | null;
  userEmailInput: string;
  userEmailInputPlaceholder: string;
  errorMsg: string | undefined;
  titleText: string;
  bodyText: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  daysUntilNextVerification: number;
  skipCallback: (() => void) | false | null;
  pageState: PageState | null;
  closeCallback: VerificationSuccessCallback | null | undefined;
  callbackReady: boolean;
};

export type IdVerificationDispatch = (action: IdVerificationAction) => void;

export type IdVerificationContextValue = {
  idVerificationState: IdVerificationState;
  dispatch: IdVerificationDispatch;
};

const initialState: IdVerificationState = {
  pageName: DisplayView.PENDING,
  isEmailVerified: false,
  isEmailSent: false,
  isEmailUpdating: false,
  origin: '',
  userEmail: '',
  userEmailInput: '',
  userEmailInputPlaceholder: LabelEmailInputPlaceholderOver13,
  errorMsg: '',
  titleText: HeadingAddEmail,
  bodyText: DescriptionAddEmailTextOver13,
  primaryButtonText: ActionContinue,
  secondaryButtonText: ActionChangeEmail,
  daysUntilNextVerification: 0,
  skipCallback: null,
  pageState: null,
  closeCallback: null,
  callbackReady: false
};

const IdVerificationStoreContext = createContext<IdVerificationContextValue>(
  initialState as unknown as IdVerificationContextValue
);

function fireCloseEvent(overage: boolean, verified: boolean) {
  // hybrid bridge for lua
  const hybrid = browserWindow?.Roblox?.Hybrid;
  if (hybrid && hybrid.Navigation) {
    hybrid.Navigation.navigateToFeature({
      feature: CloseVendorModalEvent,
      overage,
      verified
    });
  }
}

const idVerificationReducer = (
  oldState: IdVerificationState,
  action: IdVerificationAction
): IdVerificationState => {
  let pageState: PageState | null = null;
  switch (action.type) {
    case SET_INPUT_CLEAR:
      return {
        ...oldState,
        userEmailInput: ''
      };
    case SET_TRIGGER_ORIGIN:
      return {
        ...oldState,
        origin: action.origin,
        skipCallback: action.skipCallback
      };
    case SET_USER_EMAIL_STATES:
      return {
        ...oldState,
        isEmailVerified: action.isEmailVerified,
        userEmail: action.userEmail
      };
    case SET_PAGENAME_STATE:
      if (action.pageName === DisplayView.SUCCESS_OVERAGE) {
        pageState = {
          heading: 'Heading.ThankYou',
          icon: 'success-icon',
          bodyText: ['Label.OverageVerification', 'Label.VoiceChat'],
          buttonStack: [
            {
              variant: buttonVariants.primary,
              text: 'Action.OK',
              callback: () => {
                action.close();
              }
            }
          ],
          canClose: false
        };
      } else if (action.pageName === DisplayView.SUCCESS_UNDERAGE) {
        pageState = {
          heading: 'Heading.ThankYou',
          icon: 'success-icon',
          bodyText: ['Label.UnderageVerification', 'Label.VoiceChat'],
          footerText: 'Label.ToggleFeatures',
          buttonStack: [
            {
              variant: buttonVariants.primary,
              text: 'Action.Close',
              callback: () => {
                action.close();
              }
            }
          ],
          canClose: false
        };
      } else if (action.pageName === DisplayView.SUCCESS_GENERIC) {
        sendIdVerificationEvent(events.successPage, {
          origin: oldState.origin
        });

        const bodyText = ['Label.DateOfBirthUpdated'];

        if (action.isSeventeenPlus) {
          bodyText.push('Label.AccessWiderVariety');
        }

        pageState = {
          heading: 'Heading.VerificationSuccessful',
          bodyText,
          buttonStack: [
            {
              variant: buttonVariants.primary,
              text: 'Action.Close',
              callback: () => {
                sendIdVerificationEvent(events.successPageClose, {
                  origin: oldState.origin
                });
                action.close();
              }
            }
          ],
          canClose: false
        };
      } else if (action.pageName === DisplayView.EXTERNAL_EMAIL) {
        pageState = {
          heading: 'Heading.VerifyEmail',
          icon: 'shield-icon',
          bodyText: ['Label.EmailSent'],
          buttonStack: [
            {
              variant: buttonVariants.primary,
              text: 'Action.Continue',
              callback: () => {
                action.dispatch({
                  type: SET_PAGENAME_STATE,
                  pageName: DisplayView.POLLING
                });
                action.poll();
              }
            }
          ],
          userEmail: oldState.userEmail
        };
      } else if (action.pageName === DisplayView.EMAIL_CONTINUE) {
        pageState = {
          heading: 'Heading.VerificationPending',
          icon: 'shield-icon',
          bodyText: ['Label.EmailSent'],
          buttonStack: [
            {
              variant: buttonVariants.primary,
              text: 'Action.Continue',
              callback: () => {
                action.dispatch({
                  type: SET_PAGENAME_STATE,
                  pageName: DisplayView.POLLING
                });
                action.poll();
              }
            }
          ],
          userEmail: oldState.userEmail
        };
      } else if (action.pageName === DisplayView.POLLING) {
        pageState = {
          ...action
        };
      } else if (action.pageName === DisplayView.PENDING) {
        pageState = {
          heading: 'Heading.VerificationPending',
          icon: 'failure-icon',
          bodyText: ['Label.PendingVerification'],
          buttonStack: [
            {
              variant: buttonVariants.primary,
              text: 'Action.Close',
              callback: () => {
                action.close();
              }
            }
          ],
          canClose: false
        };
      } else if (action.pageName === DisplayView.FAILURE) {
        sendIdVerificationEvent(events.failurePage, {
          origin: oldState.origin
        });
        pageState = {
          heading: 'Heading.VerificationFailed',
          icon: 'failure-icon',
          bodyText: [action.textKey || 'Label.FailedVerification'],
          errorState: true,
          buttonStack: [
            {
              variant: buttonVariants.primary,
              text: 'Action.Close',
              callback: () => {
                sendIdVerificationEvent(events.failurePageClose, {
                  origin: oldState.origin
                });
                action.close();
              }
            }
          ],
          canClose: false
        };
      } else if (action.pageName === DisplayView.LANDING) {
        pageState = {
          heading: 'Heading.VerifyAge',
          icon: 'shield-icon',
          bodyText: ['Label.VoiceChatUpsell'],
          buttonStack: [
            {
              text: 'Action.SkipVoiceChat',
              callback: () => {
                action.dispatch({ type: CLEANUP_MODAL });
              }
            },
            {
              variant: buttonVariants.primary,
              text: 'Action.Continue',
              callback: () => {
                action.continue();
              }
            }
          ],
          userEmail: oldState.userEmail,
          displayCheckbox: true
        };
      } else if (action.pageName === DisplayView.ERROR) {
        pageState = {
          heading: 'Heading.Error',
          icon: 'failure-icon',
          bodyText: ['Label.GenericError'],
          buttonStack: [
            {
              variant: buttonVariants.primary,
              text: 'Action.OK',
              callback: () => {
                action.close();
              }
            }
          ],
          canClose: false
        };
      } else if (action.pageName === DisplayView.TEMP_BAN) {
        sendIdVerificationEvent(events.tempBanPage, {
          origin: oldState.origin
        });
        pageState = {
          heading: 'Heading.Error',
          icon: 'failure-icon',
          bodyText: ['Label.VerificationDeclined'],
          buttonStack: [
            {
              variant: buttonVariants.primary,
              text: 'Action.OK',
              callback: () => {
                sendIdVerificationEvent(events.tempBanPageClose, {
                  origin: oldState.origin
                });
                action.close();
              }
            }
          ],
          daysUntilNextVerification: action.daysUntilNextVerification,
          canClose: false
        };
      } else if (action.pageName === DisplayView.VENDOR_LINK) {
        if (action.useQRCode) {
          sendIdVerificationEvent(events.showQRCode, {
            origin: oldState.origin
          });
        }
        pageState = {
          verificationLink: action.verificationLink,
          useQRCode: action.useQRCode,
          origin: oldState.origin,
          redirectUrl: action.redirectUrl
        };
      } else if (action.pageName === DisplayView.ENABLE_VOICE_CHAT) {
        pageState = {
          communityStandardsUrl: new URL('/info/community-guidelines', websiteUrl).href,
          voiceFAQUrl: new URL('/info/voice-faq', websiteUrl).href,
          requireExplicitVoiceConsent: action.requireExplicitVoiceConsent,
          useVoiceUpsellV2Design: action.useVoiceUpsellV2Design,
          voiceUpsellV1Keys: {
            heading: 'Heading.LetsChat',
            enableVoiceChat: 'Label.EnableVoiceChat1',
            followCommunityStandards: 'Label.FollowCommunityStandards',
            implicitConsent: 'Label.ImplicitConsentVoiceCollectionWithML',
            explicitConsent: 'Label.ExplicitConsentVoiceCollectionWithML',
            learnMoreAboutVoiceRecording: 'Label.LearnMoreAboutVoiceRecording',
            buttonStack: [
              {
                explicitDisable: false,
                variant: buttonVariants.secondary,
                text: 'Action.SkipVoiceChat',
                callback: () => {
                  sendChatEvent(events.joinWithoutVoiceChat);
                  action.close();
                }
              },
              {
                explicitDisable: true,
                variant: buttonVariants.primary,
                text: 'Label.EnableVoiceChat',
                callback: () => {
                  postOptUserInToVoiceChat(true, true);
                  action.close();
                }
              }
            ]
          },
          voiceUpsellV2Keys: {
            heading: 'Heading.V2LetsChat',
            enableVoiceChat: 'Label.V2EnableVoiceChat1',
            followCommunityStandards: 'Label.FollowCommunityStandards',
            implicitConsent: 'Label.V2ClickToConsent',
            explicitConsent: 'Label.V2ClickToConsent',
            learnMoreAboutVoiceRecording: 'Label.LearnMoreAboutVoiceRecording',
            buttonStack: [
              {
                explicitDisable: true,
                variant: buttonVariants.primary,
                text: 'Label.V2EnableVoiceChat',
                callback: () => {
                  sendChatEvent(events.enableVoiceChatUpsell);
                  postOptUserInToVoiceChat(true, true);
                  action.close();
                }
              },
              {
                explicitDisable: false,
                variant: buttonVariants.secondary,
                text: 'Label.V2JoinWithout',
                callback: () => {
                  sendChatEvent(events.joinWithoutVoiceChat);
                  action.close();
                }
              }
            ]
          }
        };
      } else if (action.pageName === DisplayView.ENABLE_AVATAR_CHAT) {
        pageState = {
          title: 'Title.CameraUpsell',
          animateYourAvatar: 'Description.CameraUpsell',
          communityStandards: 'Description.CommunityStandardsUpsell',
          cameraPrivacy: 'Description.CameraPrivacy',
          implicitConsent: 'Description.DefaultConsentCameraUpsell',
          explicitConsent: 'Description.ExplicitConsentCameraUpsell',
          learnMore: 'Label.CameraLearnMoreUpsell',
          facialPrivacyUrl: new URL('/info/facial-animation-privacy', websiteUrl).href,
          requireExplicitCameraConsent: action.requireExplicitCameraConsent,
          useCameraU13Design: action.useCameraU13Design,
          buttons: [
            {
              text: 'Label.EnableCameraUpsell',
              explicitDisable: true,
              callback: () => {
                postOptUserInToAvatarChat(true, true);
                sendChatEvent(events.enableAvatarVideo);
                action.close();
              }
            },
            {
              text: 'Label.JoinWithoutCameraUpsell',
              explicitDisable: false,
              callback: () => {
                sendChatEvent(events.joinWithoutAvatarVideo);
                action.close();
              }
            }
          ]
        };
      }
      return {
        ...oldState,
        pageName: action.pageName,
        pageState
      };
    case SET_ERROR_STATE:
      return {
        ...oldState,
        errorMsg: action.errorMsg
      };
    case SET_EMAIL_UPDATING_STATE:
      return {
        ...oldState,
        isEmailUpdating: action.isEmailUpdating
      };
    case SET_INPUT_STATE:
      if (oldState.pageName === DisplayView.EMAIL) {
        return {
          ...oldState,
          userEmailInput: action.value,
          errorMsg: ''
        };
      }

      return oldState;
    case SET_MODAL_STATES:
      // Set modal states based on pageName
      if (oldState.pageName === DisplayView.EMAIL) {
        // Note that different texts are shown for users under 13.
        const isUserOver13 = isAuthenticated() && !isUnder13();
        const over13String = DescriptionAddEmailTextOver13;
        const under13String = DescriptionAddEmailTextUnder13;
        const headingString = HeadingAddEmail;
        let secondaryText = '';
        if (oldState.skipCallback) {
          secondaryText = ActionGenericSkip;
        }

        return {
          ...oldState,
          titleText: headingString,
          bodyText: isUserOver13 ? over13String : under13String,
          primaryButtonText: ActionContinue,
          secondaryButtonText: secondaryText,
          errorMsg: '',
          userEmailInputPlaceholder: isUserOver13
            ? LabelEmailInputPlaceholderOver13
            : LabelEmailInputPlaceholderUnder13
        };
      }
      return oldState;
    case SET_VERIFICATION_CALLBACK:
      return {
        ...oldState,
        closeCallback: action.callback,
        callbackReady: true
      };
    case SET_CALLBACK_READY:
      return {
        ...oldState,
        callbackReady: true
      };
    case CLEANUP_MODAL:
      if (oldState.callbackReady) {
        const isUserOldEnough =
          oldState.pageName === DisplayView.SUCCESS_GENERIC ||
          oldState.pageName === DisplayView.SUCCESS_OVERAGE;
        const didVerifyAge = isUserOldEnough || oldState.pageName === DisplayView.SUCCESS_UNDERAGE;
        fireCloseEvent(isUserOldEnough, didVerifyAge);
        if (oldState.closeCallback) {
          oldState.closeCallback(isUserOldEnough, didVerifyAge);
        }
      }
      return {
        ...initialState
      };
    default:
      return oldState;
  }
};

const IdVerificationStateProvider = ({ children }: { children: ReactNode }) => {
  const [idVerificationState, dispatch] = useReducer(idVerificationReducer, initialState);

  return (
    <IdVerificationStoreContext.Provider value={{ idVerificationState, dispatch }}>
      {children}
    </IdVerificationStoreContext.Provider>
  );
};

export { IdVerificationStoreContext, IdVerificationStateProvider };
