import React, { createContext, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import {
  SET_USER_EMAIL_STATES,
  SET_PAGENAME_STATE,
  SET_MODAL_STATES,
  SET_INPUT_STATE,
  SET_ERROR_STATE,
  SET_RESEND_EMAIL_STATE,
  SET_EMAIL_SENT_STATE,
  SET_EMAIL_ADDED_STATE,
  SET_EMAIL_UPDATING_STATE,
  SET_TRIGGER_ORIGIN,
  SET_INPUT_CLEAR,
} from "../actions/actionTypes";
import verificationUpsellConstants from "../constants/verificationUpsellConstants";

const {
  ActionSendConfirmationEmail,
  ActionResendConfirmationEmail,
  ActionChangeEmail,
  ActionGenericSkip,
  ActionContinue,
  ActionFinishSetup,
  ActionLogoutWithRisk,
  DescriptionVerifyEmailBody,
  DescriptionAddEmailTextOver13,
  DescriptionAddEmailTextUnder13,
  DescriptionAddEmailTextStrongMessaging,
  DescriptionAddEmailTextStrongMessagingU13,
  HeadingVerifyEmail,
  HeadingAddEmail,
  HeadingAddEmailHomePage,
  HeadingCompleteSetupOnLogout,
  LabelEmailInputPlaceholderOver13,
  LabelEmailInputPlaceholderUnder13,
  LabelEmailInputPlaceholderUnder13V2,
  HomePageAddEmailTextOver13,
  HomePageAddEmailTextUnder13,
} = verificationUpsellConstants;

export type EmailUpsellState = {
  pageName: string;
  isModalOpen: boolean;
  isEmailSent: boolean;
  isEmailUpdating: boolean;
  isEmailAdded: boolean;
  origin: string;
  userEmailInput: string;
  userEmailInputPlaceholder: string;
  errorMsg: string;
  titleText: string;
  bodyText: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  // Optional, not just nullable: the only dispatch site reads these off a CustomEvent detail,
  // where they can be absent.
  skipCallback?: (() => void) | null;
  // Called with isEmailAdded by the container.
  closeCallback?: ((isEmailAdded: boolean) => void) | null;
  userEmail?: string;
  isEmailVerified?: boolean;
};

export type EmailUpsellAction =
  | { type: typeof SET_INPUT_CLEAR }
  | {
      type: typeof SET_TRIGGER_ORIGIN;
      origin: string;
      skipCallback?: (() => void) | null;
      closeCallback?: ((isEmailAdded: boolean) => void) | null;
    }
  | { type: typeof SET_USER_EMAIL_STATES; userEmail?: string; isEmailVerified?: boolean }
  | { type: typeof SET_PAGENAME_STATE; pageName: string }
  | { type: typeof SET_ERROR_STATE; errorMsg: string }
  | { type: typeof SET_EMAIL_UPDATING_STATE; isEmailUpdating: boolean }
  | { type: typeof SET_EMAIL_SENT_STATE }
  | { type: typeof SET_EMAIL_ADDED_STATE }
  | { type: typeof SET_RESEND_EMAIL_STATE }
  | { type: typeof SET_INPUT_STATE; value: string }
  | { type: typeof SET_MODAL_STATES };

const initialState: EmailUpsellState = {
  pageName: "",
  isModalOpen: false,
  isEmailVerified: false,
  isEmailSent: false,
  isEmailUpdating: false,
  isEmailAdded: false,
  origin: "",
  userEmail: "",
  userEmailInput: "",
  userEmailInputPlaceholder: LabelEmailInputPlaceholderOver13,
  errorMsg: "",
  titleText: HeadingVerifyEmail,
  bodyText: DescriptionVerifyEmailBody,
  primaryButtonText: ActionResendConfirmationEmail,
  secondaryButtonText: ActionChangeEmail,
  skipCallback: null,
  closeCallback: null,
};

const EmailUpsellModalStoreContext = createContext<{
  emailUpsellState: EmailUpsellState;
  dispatch: Dispatch<EmailUpsellAction>;
}>({ emailUpsellState: initialState, dispatch: () => undefined });

const reducer = (oldState: EmailUpsellState, action: EmailUpsellAction): EmailUpsellState => {
  switch (action.type) {
    // email verification actions
    case SET_INPUT_CLEAR:
      return {
        ...oldState,
        userEmailInput: "",
      };
    case SET_TRIGGER_ORIGIN:
      return {
        ...oldState,
        origin: action.origin,
        skipCallback: action.skipCallback,
        closeCallback: action.closeCallback,
      };
    case SET_USER_EMAIL_STATES:
      return {
        ...oldState,
        isEmailVerified: action.isEmailVerified,
        userEmail: action.userEmail,
      };
    case SET_PAGENAME_STATE:
      return {
        ...oldState,
        pageName: action.pageName,
      };
    case SET_ERROR_STATE:
      return {
        ...oldState,
        errorMsg: action.errorMsg,
      };
    case SET_EMAIL_UPDATING_STATE:
      return {
        ...oldState,
        isEmailUpdating: action.isEmailUpdating,
      };
    case SET_EMAIL_SENT_STATE:
      return {
        ...oldState,
        isEmailSent: true,
      };
    case SET_EMAIL_ADDED_STATE:
      return { ...oldState, isEmailAdded: true };
    case SET_RESEND_EMAIL_STATE:
      return {
        ...oldState,
        isEmailSent: false,
      };
    case SET_INPUT_STATE:
      if (oldState.pageName === verificationUpsellConstants.UpdateEmail) {
        return {
          ...oldState,
          userEmailInput: action.value,
          errorMsg: "",
        };
      }
      return oldState;

    case SET_MODAL_STATES:
      // Set modal states based on pageName and experiment parameter values
      if (oldState.pageName === verificationUpsellConstants.UpdateEmail) {
        // Note that different texts are shown for users under 13.
        const currentUser = authenticatedUser();
        const isUserOver13 = currentUser != null && !currentUser.isUnder13;
        let userEmailInputPlaceholderString;
        if (isUserOver13) {
          userEmailInputPlaceholderString = LabelEmailInputPlaceholderOver13;
        } else {
          userEmailInputPlaceholderString = LabelEmailInputPlaceholderUnder13V2;
        }
        let primaryText = ActionSendConfirmationEmail;
        let secondaryText = "";
        let bodyString;
        let headingString;

        if (oldState.skipCallback) {
          secondaryText = ActionGenericSkip;
        }
        switch (oldState.origin) {
          case verificationUpsellConstants.Logout:
            headingString = HeadingCompleteSetupOnLogout;
            if (isUserOver13) {
              bodyString = DescriptionAddEmailTextStrongMessaging;
            } else {
              bodyString = DescriptionAddEmailTextStrongMessagingU13;
            }
            primaryText = ActionFinishSetup;
            secondaryText = ActionLogoutWithRisk;
            break;
          case verificationUpsellConstants.HomePage:
          case verificationUpsellConstants.NotApprovedPage:
            headingString = HeadingAddEmailHomePage;
            bodyString = isUserOver13 ? HomePageAddEmailTextOver13 : HomePageAddEmailTextUnder13;
            primaryText = ActionContinue;
            break;
          default:
            headingString = HeadingAddEmail;
            bodyString = isUserOver13
              ? DescriptionAddEmailTextOver13
              : DescriptionAddEmailTextUnder13;
        }

        return {
          ...oldState,
          pageName: verificationUpsellConstants.UpdateEmail,
          titleText: headingString,
          bodyText: bodyString,
          primaryButtonText: primaryText,
          secondaryButtonText: secondaryText,
          errorMsg: "",
          userEmailInputPlaceholder: userEmailInputPlaceholderString,
        };
      }
      // oldState.pageName is verificationUpsellConstants.Verification)
      return {
        ...oldState,
        pageName: verificationUpsellConstants.Verification,
        titleText: HeadingVerifyEmail,
        bodyText: DescriptionVerifyEmailBody,
        primaryButtonText: ActionResendConfirmationEmail,
        secondaryButtonText: ActionChangeEmail,
        errorMsg: "",
      };
    default:
      return oldState;
  }
};

const EmailUpsellModalStateProvider = ({ children }: { children: ReactNode }) => {
  const [emailUpsellState, dispatch] = useReducer(reducer, initialState);

  return (
    <EmailUpsellModalStoreContext.Provider value={{ emailUpsellState, dispatch }}>
      {children}
    </EmailUpsellModalStoreContext.Provider>
  );
};

export { EmailUpsellModalStoreContext, EmailUpsellModalStateProvider };
