import React from "react";
import { RequestService } from "../../../common/request";
import TurnstileV1 from "./containers/turnstile";
import {
  OnChallengeCompletedCallback,
  OnChallengeDisplayedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback,
} from "./interface";
import { EventService } from "./services/eventService";
import { MetricsService } from "./services/metricsService";
import { TurnstileContextProvider } from "./store/contextProvider";

type Props = {
  challengeId: string;
  // eslint-disable-next-line react/require-default-props
  appType?: string;
  siteKey: string;
  renderInline: boolean;
  eventService: EventService;
  metricsService: MetricsService;
  requestService: RequestService;
  onChallengeDisplayed: OnChallengeDisplayedCallback;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
  onModalChallengeAbandoned: OnModalChallengeAbandonedCallback | null;
};

export const App: React.FC<Props> = ({
  challengeId,
  appType,
  siteKey,
  renderInline,
  eventService,
  metricsService,
  requestService,
  onChallengeDisplayed,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned,
}: Props) => {
  return (
    <TurnstileContextProvider
      challengeId={challengeId}
      appType={appType}
      siteKey={siteKey}
      renderInline={renderInline}
      eventService={eventService}
      metricsService={metricsService}
      requestService={requestService}
      onChallengeDisplayed={onChallengeDisplayed}
      onChallengeCompleted={onChallengeCompleted}
      onChallengeInvalidated={onChallengeInvalidated}
      onModalChallengeAbandoned={onModalChallengeAbandoned}
    >
      <TurnstileV1 />
    </TurnstileContextProvider>
  );
};

export default App;
