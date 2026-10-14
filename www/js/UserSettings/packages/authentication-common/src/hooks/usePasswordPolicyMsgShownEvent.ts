import { useEffect, useRef } from "react";
import EVENT_CONSTANTS from "../constants/eventsConstants";
import { passwordValidatorErrorMessages } from "../constants/validationConstants";

const passwordPolicyMsgStates = new Map<string, string>([
  [
    passwordValidatorErrorMessages.PasswordLowComplexity,
    EVENT_CONSTANTS.state.passwordPolicy.lowComplexity,
  ],
  [
    passwordValidatorErrorMessages.PasswordTooSimilarToUsername,
    EVENT_CONSTANTS.state.passwordPolicy.tooSimilarToUsername,
  ],
]);

/** The authMsgShown `state` for a strict password-policy message, or null for any other. */
export const getPasswordPolicyMsgState = (messageKey?: string | null): string | null =>
  passwordPolicyMsgStates.get(messageKey ?? "") ?? null;

/**
 * Reports each appearance of a strict password-policy message. Keyed on the message being
 * displayed rather than on validation responses, so debounced re-validations that keep
 * returning the message already on screen do not report it again.
 */
const usePasswordPolicyMsgShownEvent = (
  displayedMessageKey: string | null | undefined,
  sendMsgShown: (state: string) => void,
): void => {
  const state = getPasswordPolicyMsgState(displayedMessageKey);
  const sendMsgShownRef = useRef(sendMsgShown);
  sendMsgShownRef.current = sendMsgShown;

  useEffect(() => {
    if (state !== null) {
      sendMsgShownRef.current(state);
    }
  }, [state]);
};

export default usePasswordPolicyMsgShownEvent;
