import { useEffect, useState } from "react";
import { document, window } from "@rbx/core-lib/browser";

declare global {
  interface Window {
    // On the window, not in this module, so the bundle that hides the bumper and the bumper's own
    // bundle (each with a copy of this module on .NET) share it.
    rbxAppBumperSuppressions?: number;
  }
}

const changeEventName = "rbx-app-bumper-suppression-change";

const notifyChange = (): void => {
  document?.dispatchEvent(new Event(changeEventName));
};

/** Whether something on the page holds the mobile app bumper hidden. */
export const isAppBumperSuppressed = (): boolean => (window?.rbxAppBumperSuppressions ?? 0) > 0;

/**
 * Hides the mobile app bumper until the returned release is called. Holds add up: the bumper comes
 * back once every hold is released. Calling a release again does nothing.
 */
export const suppressAppBumper = (): (() => void) => {
  const win = window;
  if (win == null) {
    return () => undefined;
  }
  win.rbxAppBumperSuppressions = (win.rbxAppBumperSuppressions ?? 0) + 1;
  notifyChange();
  let isReleased = false;
  return () => {
    if (isReleased) {
      return;
    }
    isReleased = true;
    win.rbxAppBumperSuppressions = Math.max((win.rbxAppBumperSuppressions ?? 1) - 1, 0);
    notifyChange();
  };
};

/** `isAppBumperSuppressed()`, updated as holds come and go. */
export const useIsAppBumperSuppressed = (): boolean => {
  const [isSuppressed, setIsSuppressed] = useState(isAppBumperSuppressed);
  useEffect(() => {
    const onChange = () => {
      setIsSuppressed(isAppBumperSuppressed());
    };
    // A hold may have changed between the render and this effect.
    onChange();
    document?.addEventListener(changeEventName, onChange);
    return () => {
      document?.removeEventListener(changeEventName, onChange);
    };
  }, []);
  return isSuppressed;
};
