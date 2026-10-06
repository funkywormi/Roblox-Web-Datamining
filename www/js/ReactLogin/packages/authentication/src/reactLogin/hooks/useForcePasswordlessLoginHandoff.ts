import { MutableRefObject, useEffect, useRef, useState } from "react";
import { forcePasswordlessLoginEvents } from "../../forcePasswordlessLogin/contract";

type Handlers = {
  /** The challenge replaced the password form; the challenged password must not be reused. */
  onShown: () => void;
  onUseEmailOtp: () => void;
  onUsePasskey: () => void;
};

type ForcePasswordlessLoginHandoff = {
  isActive: boolean;
  /** For handlers that close over an earlier render. */
  isActiveRef: MutableRefObject<boolean>;
  notifyLoginFailed: () => void;
  notifyEmailOtpClosed: () => void;
};

/**
 * The login page's side of the force passwordless login challenge, which the generic challenge
 * service renders over this page. The challenge asks the page over window events to run a
 * passwordless sign-in, and the page reports back when one fails or its modal closes.
 */
const useForcePasswordlessLoginHandoff = (handlers: Handlers): ForcePasswordlessLoginHandoff => {
  const [isActive, setIsActive] = useState(false);
  const isActiveRef = useRef(false);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const listeners: [string, () => void][] = [
      [
        forcePasswordlessLoginEvents.shown,
        () => {
          isActiveRef.current = true;
          setIsActive(true);
          handlersRef.current.onShown();
        },
      ],
      [
        forcePasswordlessLoginEvents.hidden,
        () => {
          isActiveRef.current = false;
          setIsActive(false);
        },
      ],
      [forcePasswordlessLoginEvents.useEmailOtp, () => handlersRef.current.onUseEmailOtp()],
      [forcePasswordlessLoginEvents.usePasskey, () => handlersRef.current.onUsePasskey()],
    ];
    listeners.forEach(([event, listener]) => window.addEventListener(event, listener));
    return () => {
      listeners.forEach(([event, listener]) => window.removeEventListener(event, listener));
    };
  }, []);

  const notify = (event: string) => {
    if (isActiveRef.current) {
      window.dispatchEvent(new Event(event));
    }
  };

  return {
    isActive,
    isActiveRef,
    notifyLoginFailed: () => notify(forcePasswordlessLoginEvents.loginFailed),
    notifyEmailOtpClosed: () => notify(forcePasswordlessLoginEvents.emailOtpClosed),
  };
};

export default useForcePasswordlessLoginHandoff;
