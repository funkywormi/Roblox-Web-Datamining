"use client";

import React, { useCallback, useEffect, useState } from "react";
import { window as browserWindow, document as browserDocument } from "@rbx/core-lib/browser";
import { Button } from "@rbx/foundation-ui";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function areValidMeasurements(contentHeight: number, viewportHeight: number): boolean {
  return (
    Number.isFinite(contentHeight) &&
    Number.isFinite(viewportHeight) &&
    contentHeight >= 0 &&
    viewportHeight >= 0
  );
}

interface BackToTopButtonProps {
  enabled: boolean;
  feedColumnRef: React.MutableRefObject<HTMLDivElement | null>;
  text: string;
  /**
   * Called after the scroll to top has started successfully, so clients can fire relevant
   * telemetry. Not called if the feed target is missing or scrolling throws.
   */
  onClick: () => void;
}

export function BackToTopButton({
  enabled,
  feedColumnRef,
  text,
  onClick,
}: BackToTopButtonProps): React.JSX.Element | null {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const scrollTarget = feedColumnRef.current;
    if (!enabled || scrollTarget == null || browserWindow == null || browserDocument == null) {
      setIsVisible(false);
      return undefined;
    }

    // Home and Search put a footer after the feed. The feed's bottom edge can
    // sit on screen while that footer still makes the page scroll.
    const scrollingElement = browserDocument.scrollingElement ?? browserDocument.documentElement;
    const updateVisibility = () => {
      const contentHeight = scrollingElement.scrollHeight;
      const viewportHeight = scrollingElement.clientHeight;
      setIsVisible(
        areValidMeasurements(contentHeight, viewportHeight) && contentHeight > viewportHeight,
      );
    };

    const resizeObserver = new browserWindow.ResizeObserver(updateVisibility);
    resizeObserver.observe(scrollTarget);
    if (scrollingElement !== scrollTarget) {
      resizeObserver.observe(scrollingElement);
    }
    if (browserDocument.body !== scrollTarget && browserDocument.body !== scrollingElement) {
      resizeObserver.observe(browserDocument.body);
    }
    browserWindow.addEventListener("resize", updateVisibility);
    updateVisibility();

    return () => {
      resizeObserver.disconnect();
      browserWindow?.removeEventListener("resize", updateVisibility);
    };
  }, [enabled, feedColumnRef]);

  const activate = useCallback(() => {
    const scrollTarget = feedColumnRef.current;
    if (scrollTarget == null || browserWindow == null) {
      return;
    }

    const behavior = browserWindow.matchMedia(REDUCED_MOTION_QUERY).matches ? "auto" : "smooth";
    try {
      browserWindow.scrollTo({ top: 0, behavior });
    } catch {
      return;
    }

    onClick();

    scrollTarget.tabIndex = -1;
    scrollTarget.focus({ preventScroll: true });
  }, [feedColumnRef, onClick]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="flex justify-center padding-y-large">
      <Button as="button" variant="Utility" onClick={activate}>
        {text}
      </Button>
    </div>
  );
}
