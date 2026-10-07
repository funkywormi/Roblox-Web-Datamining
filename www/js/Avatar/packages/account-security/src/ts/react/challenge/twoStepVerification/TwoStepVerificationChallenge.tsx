import { useEffect, useMemo } from "react";
import type { WithTranslationsProps } from "@rbx/core-scripts/react";
import * as nextEventTracker from "@rbx/www-common/event-tracker";
import { RequestServiceDefault } from "../../../common/request";
import { App } from "./App";
import { ChallengeParameters } from "./interface";
import { EventServiceDefault } from "./services/eventService";
import { MetricsServiceDefault } from "./services/metricsService";

// React 19 / Next.js version of renderChallenge: the Next host renders this and injects `translate`.
// Client mount only (dynamic ssr: false). Not yet self-contained on Next — needs styles, a
// twoStepVerificationApi env-urls shim, and the App graph de-globaled; see the PR for follow-ups.

// Distributive Omit so ChallengeParameters' renderInline/onModalChallengeAbandoned union survives;
// a plain Omit collapses it and would allow modal mode with a null handler.
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type TwoStepVerificationChallengeProps = DistributiveOmit<
  ChallengeParameters,
  "containerId"
> &
  Pick<WithTranslationsProps, "translate">;

export const TwoStepVerificationChallenge = ({
  translate,
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
      translate={translate}
      // App requires `intl` but never reads it (formatting comes later).
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      intl={{} as WithTranslationsProps["intl"]}
      onChallengeCompleted={onChallengeCompleted}
      onChallengeInvalidated={onChallengeInvalidated}
      onModalChallengeAbandoned={onModalChallengeAbandoned}
      delayParameters={delayParameters}
      recoveryParameters={recoveryParameters}
    />
  );
};

export default TwoStepVerificationChallenge;
