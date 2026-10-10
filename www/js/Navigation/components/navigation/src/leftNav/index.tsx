import { useEffect, useRef } from "react";
import { authenticatedUser, type AuthenticatedUser } from "@rbx/core-scripts/meta/user";
import LeftNavigationOld from "./old";
import LeftNavigationNew from "./new";
import { isAccountExperienceRevampEnabled } from "../util/accountExperienceUtils";
import { useNewLeftNav } from "./newLeftNav";
import {
  getDeviceType,
  LeftNavErrorBoundary,
  publishHistogram,
  trackCounter,
} from "./observability";

function LeftNavigationArm({
  user,
  isNew,
  isSettled,
}: {
  user: AuthenticatedUser;
  isNew: boolean;
  isSettled: boolean;
}) {
  const hasTrackedRender = useRef(false);
  const variant = isNew ? "NEW" : "OLD";

  useEffect(() => {
    if (!isSettled || hasTrackedRender.current) {
      return;
    }
    hasTrackedRender.current = true;
    const deviceType = getDeviceType();
    trackCounter("Rendered", { variant, deviceType });
    publishHistogram("RenderedMs", { variant, deviceType }, performance.now());
  }, [isSettled, variant]);

  return isNew ? <LeftNavigationNew user={user} /> : <LeftNavigationOld />;
}

export default function LeftNavigation() {
  const { isNew, isSettled } = useNewLeftNav();
  const user = authenticatedUser();
  if (!user?.isAuthenticated || isAccountExperienceRevampEnabled()) {
    return null;
  }

  return (
    <LeftNavErrorBoundary name="LeftNavReactCrash">
      <LeftNavigationArm user={user} isNew={isNew} isSettled={isSettled} />
    </LeftNavErrorBoundary>
  );
}
