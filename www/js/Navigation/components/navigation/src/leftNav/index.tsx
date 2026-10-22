import { useEffect, useRef } from "react";
import { AuthenticatedUser } from "@rbx/core-scripts/meta/user";
import {
  LeftNavErrorBoundary,
  getDeviceType,
  publishHistogram,
  trackCounter,
} from "./observability";
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
    publishHistogram("RenderedMs", { variant: "NEW", deviceType }, performance.now());
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
