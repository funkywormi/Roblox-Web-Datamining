import { useEffect, useRef } from "react";
import { AuthenticatedUser } from "@rbx/core-scripts/meta/user";
import {
  LeftNavErrorBoundary,
  getDeviceType,
  publishHistogram,
  trackCounter,
} from "./observability";
import { getWasHidden, logTimingDebug } from "../util/pageVisibility";
import LeftNavigationContent from "./LeftNavigation";

function LeftNavigationWithMetrics({ user }: { user: AuthenticatedUser }) {
  const hasTrackedRender = useRef(false);
  useEffect(() => {
    if (hasTrackedRender.current) {
      return;
    }
    hasTrackedRender.current = true;
    const deviceType = getDeviceType();
    trackCounter("Rendered", { variant: "NEW", deviceType });
    const renderedMs = performance.now();
    const timingDimensions = { variant: "NEW", deviceType, wasHidden: getWasHidden() };
    publishHistogram("RenderedMs", timingDimensions, renderedMs);
    logTimingDebug("LeftNav_RenderedMs", renderedMs, timingDimensions);
  }, []);

  return <LeftNavigationContent user={user} />;
}

export default function LeftNavigation({ user }: { user: AuthenticatedUser }) {
  return (
    <LeftNavErrorBoundary name="LeftNavReactCrash">
      <LeftNavigationWithMetrics user={user} />
    </LeftNavErrorBoundary>
  );
}
