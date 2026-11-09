import { useEffect, useMemo } from "react";
import * as nextEventTracker from "@rbx/www-common/event-tracker";
import { RequestServiceDefault } from "../../../common/request";
import { App } from "./App";
import { EventServiceDefault } from "./services/eventService";
import { MetricsServiceDefault } from "./services/metricsService";
import type {
  TwoStepVerificationChallenge as Declared,
  TwoStepVerificationChallengeProps,
} from "./nextInterface";

// React 19 / Next.js version of renderChallenge. The host must provide an i18n provider that
// includes `Authentication.TwoStepVerification`. Client mount only (dynamic ssr: false).

export type { TwoStepVerificationChallengeProps };

export const TwoStepVerificationChallenge: typeof Declared = ({
  userId,
  challengeId,
  appType,
  actionType,
  renderInline,
  shouldModifyBrowserHistory,
  shouldShowRememberDeviceCheckbox,
  delayParameters,
  recoveryParameters,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned,
}: TwoStepVerificationChallengeProps) => {
  const { eventService, metricsService, requestService } = useMemo(() => {
    const request = new RequestServiceDefault();
    return {
      requestService: request,
      eventService: new EventServiceDefault(challengeId, userId),
      // Off .NET there's no window.EventTracker, so pass the www-common tracker to keep metrics firing.
      metricsService: new MetricsServiceDefault(actionType, appType, request, nextEventTracker),
    };
  }, [challengeId, userId, actionType, appType]);

  useEffect(() => {
    eventService.sendChallengeInitializedEvent();
    metricsService.fireInitializedEvent();
  }, [eventService, metricsService]);

  return (
    <App
      // App snapshots the services at mount, so remount when their inputs change.
      key={`${challengeId}-${userId}-${actionType}-${appType}`}
      userId={userId}
      challengeId={challengeId}
      actionType={actionType}
      renderInline={renderInline}
      shouldModifyBrowserHistory={shouldModifyBrowserHistory ?? false}
      shouldShowRememberDeviceCheckbox={shouldShowRememberDeviceCheckbox}
      eventService={eventService}
      metricsService={metricsService}
      requestService={requestService}
      onChallengeCompleted={onChallengeCompleted}
      onChallengeInvalidated={onChallengeInvalidated}
      onModalChallengeAbandoned={onModalChallengeAbandoned}
      delayParameters={delayParameters}
      recoveryParameters={recoveryParameters}
    />
  );
};

export default TwoStepVerificationChallenge;
