import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { document, window } from "@rbx/core-lib/browser";
import { getItem, setItem } from "@rbx/core-lib/local-storage";
import { getDeviceMeta, isWindows } from "@rbx/core-scripts/meta/device";
import AppDownloadBanner, { type AppDownloadBannerPlatform } from "./AppDownloadBanner";
import { suppressAppBumper } from "./appBumperSuppression";
import { sendAppDownloadBannerEvent } from "./appDownloadService";
import { downloadSourceType } from "./deferredDeeplinkConstants";

declare module "@rbx/core-lib/local-storage" {
  interface LocalStorageRegistry {
    /** When the top app banner last showed, and when it was closed (ms since epoch). */
    "top-app-banner": { lastShown?: number; dismissedAt?: number };
  }
}

/** The navigation's empty slot above the top nav. Its CSS pins it and moves the page down. */
const slotId = "top-app-banner";
/** Read by the navigation CSS, which moves the header, the left nav and the page down by it. */
const heightVariable = "--top-app-banner-height";
const storageKey = "top-app-banner";

/** How long a pending Play on Web answer may keep the app bumper hidden. */
export const pendingAppBumperHoldMs = 5000;

/**
 * Whether a stored time falls on today's local calendar day, in the time zone the device is in now.
 * Not a number, like the day string earlier builds stored, means it didn't.
 */
const isToday = (time: unknown): boolean => {
  if (typeof time !== "number") {
    return false;
  }
  const day = new Date(time);
  const today = new Date();
  return (
    day.getFullYear() === today.getFullYear() &&
    day.getMonth() === today.getMonth() &&
    day.getDate() === today.getDate()
  );
};

/** Saves the banner's state, keeping only the fields it still uses. */
const saveState = (update: { lastShown?: number; dismissedAt?: number }) => {
  const { lastShown, dismissedAt } = getItem(storageKey) ?? {};
  return setItem(storageKey, { lastShown, dismissedAt, ...update });
};

/**
 * The navigation's slot, once its CSS has pinned it. Without that CSS, such as with an older
 * navigation, the banner would sit in the page under the header, so there's no slot.
 */
const readSlot = (): HTMLElement | null => {
  const slot = document?.getElementById(slotId);
  return slot != null && window?.getComputedStyle(slot).position === "fixed" ? slot : null;
};

const isDismissed = (): boolean => getItem(storageKey)?.dismissedAt != null;

/** Not closed, and not shown yet today. */
const isDue = (): boolean => !isDismissed() && !isToday(getItem(storageKey)?.lastShown);

const readPlatform = (): AppDownloadBannerPlatform => {
  if (!getDeviceMeta()?.isDesktop) {
    return "mobile";
  }
  return isWindows() ? "windows" : "mac";
};

/** Opens the experience's page in the app, the same deep link the app bumper uses there. */
const gameDetailsDeepLink = (universeId: string): string => {
  const link = new URL("roblox://navigation/game_details");
  link.searchParams.set("gameId", universeId);
  return link.toString();
};

export type TopAppBannerProps = {
  /** The page's experience. On mobile, Get opens it in the app, or the store without the app. */
  universeId: string;
  /** The page's Play on Web variant is a treatment arm, not `None`. */
  isTreatment: boolean;
  /** The variant is still loading for a user who could get a treatment arm. */
  isPending: boolean;
};

/**
 * The app download banner for the Play on Web treatment, pinned above the top nav. It shows on the
 * first page view of each local day and stays for the rest of that view; closing it hides it for
 * good. On mobile the treatment keeps the app bumper off, even after the banner is closed. Mount it
 * in the navigation's `#top-app-banner` slot, with a `QueryClientProvider` and a `use-intl` provider
 * with `appDownloadNamespaces`.
 */
export default function TopAppBanner({ universeId, isTreatment, isPending }: TopAppBannerProps) {
  const [slot] = useState(readSlot);
  const [platform] = useState(readPlatform);
  const [isDueView] = useState(isDue);
  const [isDayRecorded, setIsDayRecorded] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const isShown = isDayRecorded && !isClosed;
  const ref = useRef<HTMLDivElement>(null);
  // Kept once seen, so the bumper stays off for the rest of the view even if the variant later
  // reads `None`, like after a failed playability refetch on a back-forward cache restore.
  const [isTreatmentView, setIsTreatmentView] = useState(isTreatment);
  if (isTreatment && !isTreatmentView) {
    setIsTreatmentView(true);
  }

  // Without the slot there's no banner to make room for, so the bumper stays.
  const holdsBumper = slot != null && platform === "mobile" && (isTreatmentView || isPending);
  const bumperHold = useRef<(() => void) | null>(null);
  // One hold, kept from pending to treatment, so the bumper never shows in between. A layout
  // effect: on .NET this page and the app bumper both render on DOMContentLoaded, so the hold
  // starts in the same task as the bumper's first render, before anything paints. It runs again
  // when the treatment arrives, to hold again after the pending timeout.
  useLayoutEffect(() => {
    if (holdsBumper) {
      bumperHold.current ??= suppressAppBumper();
    } else {
      bumperHold.current?.();
      bumperHold.current = null;
    }
  }, [holdsBumper, isTreatmentView]);

  // Control users have the bumper hidden too until the variant loads, so don't wait for long.
  useEffect(() => {
    if (!holdsBumper || isTreatmentView) {
      return undefined;
    }
    const timeout = setTimeout(() => {
      bumperHold.current?.();
      bumperHold.current = null;
    }, pendingAppBumperHoldMs);
    return () => {
      clearTimeout(timeout);
    };
  }, [holdsBumper, isTreatmentView]);

  useLayoutEffect(() => {
    const hold = bumperHold;
    return () => {
      hold.current?.();
    };
  }, []);

  // If the day can't be saved, nothing shows, as it would on every page view. Due is checked again,
  // as another tab may have shown or closed the banner while this one waited for the variant.
  const isDueTreatment = slot != null && isDueView && isTreatmentView;
  useEffect(() => {
    if (isDueTreatment && isDue() && saveState({ lastShown: Date.now() }).isOk()) {
      setIsDayRecorded(true);
    }
  }, [isDueTreatment]);

  useEffect(() => {
    if (isShown) {
      sendAppDownloadBannerEvent("shown");
    }
  }, [isShown]);

  // A page restored from the back-forward cache keeps its state, so pick up a close made since.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted && isDismissed()) {
        setIsClosed(true);
      }
    };
    window?.addEventListener("pageshow", onPageShow);
    return () => {
      window?.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  useLayoutEffect(() => {
    const banner = ref.current;
    const root = document?.documentElement;
    if (banner == null || root == null) {
      return undefined;
    }
    const setHeight = () => {
      root.style.setProperty(heightVariable, `${String(banner.offsetHeight)}px`);
    };
    setHeight();
    const ResizeObserver = window?.ResizeObserver;
    const observer = ResizeObserver == null ? null : new ResizeObserver(setHeight);
    observer?.observe(banner);
    return () => {
      observer?.disconnect();
      root.style.removeProperty(heightVariable);
    };
  }, [isShown]);

  const dismiss = () => {
    sendAppDownloadBannerEvent("dismissed");
    saveState({ dismissedAt: Date.now() });
    setIsClosed(true);
  };

  if (!isShown || slot == null) {
    return null;
  }
  return (
    // The banner's own background is translucent, so the strip gets the page's opaque one.
    <div ref={ref} className="bg-surface-0">
      <AppDownloadBanner
        platform={platform}
        downloadSource={downloadSourceType.Installer}
        appsFlyerParams={
          platform === "mobile" && universeId !== ""
            ? { af_dp: gameDetailsDeepLink(universeId) }
            : undefined
        }
        onDismiss={dismiss}
      />
    </div>
  );
}
