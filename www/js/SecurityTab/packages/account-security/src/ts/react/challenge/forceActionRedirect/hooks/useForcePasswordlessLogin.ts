import React from "react";
import {
  CODE_MODAL_CLOSE_EVENT,
  openModal,
} from "@rbx/authentication/crossDeviceLoginDisplayCodeModal/services/crossDeviceLoginDisplayCodeService";
import {
  forcePasswordlessLoginEvents,
  readLoginPageSupport,
} from "@rbx/authentication/forcePasswordlessLogin/contract";
import useForceActionRedirectContext from "./useForceActionRedirectContext";

type ForcePasswordlessLogin = {
  /** Quick Login or the email code modal has taken over, so the challenge steps aside. */
  isHandedOff: boolean;
  isOpeningQuickLogin: boolean;
  hasError: boolean;
  isPasskeyOffered: boolean;
  isEmailOtpOffered: boolean;
  startQuickLogin: () => void;
  startPasskey: () => void;
  startEmailOtp: () => void;
};

/**
 * Drives the force passwordless login challenge. The login page (LoginBase) and the Quick Login
 * modal run every sign-in method; this hook starts them over window events and reflects what
 * they report back.
 */
const useForcePasswordlessLogin = (): ForcePasswordlessLogin => {
  const {
    state: { isModalVisible },
  } = useForceActionRedirectContext();
  const [isOpeningQuickLogin, setIsOpeningQuickLogin] = React.useState(false);
  const [isHandedOff, setIsHandedOff] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const openingQuickLogin = React.useRef(false);

  // Keyed on visibility rather than mount: a dismissed modal stays mounted, and LoginBase
  // keeps the password form hidden until it receives the hidden event.
  React.useEffect(() => {
    if (!isModalVisible) return undefined;

    const returnToChallenge = () => setIsHandedOff(false);
    const showLoginError = () => {
      setIsHandedOff(false);
      setHasError(true);
    };
    window.addEventListener(CODE_MODAL_CLOSE_EVENT, returnToChallenge);
    window.addEventListener(forcePasswordlessLoginEvents.emailOtpClosed, returnToChallenge);
    window.addEventListener(forcePasswordlessLoginEvents.loginFailed, showLoginError);
    window.dispatchEvent(new Event(forcePasswordlessLoginEvents.shown));
    return () => {
      window.removeEventListener(CODE_MODAL_CLOSE_EVENT, returnToChallenge);
      window.removeEventListener(forcePasswordlessLoginEvents.emailOtpClosed, returnToChallenge);
      window.removeEventListener(forcePasswordlessLoginEvents.loginFailed, showLoginError);
      window.dispatchEvent(new Event(forcePasswordlessLoginEvents.hidden));
    };
  }, [isModalVisible]);

  const openQuickLogin = async () => {
    if (openingQuickLogin.current) return;
    // This challenge diverts login on the browser login page. Other surfaces have no
    // AuthToken listener and must not offer a code that cannot finish signing in.
    if (
      !readLoginPageSupport().isReady ||
      !document.getElementById("crossDeviceLoginDisplayCodeModal-container")
    ) {
      setHasError(true);
      return;
    }
    openingQuickLogin.current = true;
    setIsOpeningQuickLogin(true);
    setHasError(false);
    try {
      const opened = await openModal();
      setIsHandedOff(opened);
      setHasError(!opened);
    } catch {
      setHasError(true);
    } finally {
      openingQuickLogin.current = false;
      setIsOpeningQuickLogin(false);
    }
  };

  const startEmailOtp = () => {
    if (openingQuickLogin.current) return;
    setHasError(false);
    setIsHandedOff(true);
    window.dispatchEvent(new Event(forcePasswordlessLoginEvents.useEmailOtp));
  };

  // The browser's passkey prompt opens over this challenge, which stays up so a cancelled
  // prompt leaves the options in place.
  const startPasskey = () => {
    if (openingQuickLogin.current) return;
    setHasError(false);
    window.dispatchEvent(new Event(forcePasswordlessLoginEvents.usePasskey));
  };

  // LoginBase owns whether passkeys and email one-time codes are offered on this page.
  const { isPasskeyOffered, isEmailOtpOffered } = readLoginPageSupport();

  return {
    isHandedOff,
    isOpeningQuickLogin,
    hasError,
    isPasskeyOffered,
    isEmailOtpOffered,
    startQuickLogin: () => {
      openQuickLogin().catch(() => setHasError(true));
    },
    startPasskey,
    startEmailOtp,
  };
};

export default useForcePasswordlessLogin;
