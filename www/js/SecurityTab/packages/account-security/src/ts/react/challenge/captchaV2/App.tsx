import React from "react";
import { RequestService } from "../../../common/request";
import CaptchaV2 from "./containers/captchaV2";
import {
  OnChallengeCompletedCallback,
  OnChallengeDisplayedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback,
} from "./interface";
import { EventService } from "./services/eventService";
import { MetricsService } from "./services/metricsService";
import { CaptchaV2ContextProvider } from "./store/contextProvider";

type Props = {
  challengeId: string;
  // eslint-disable-next-line react/require-default-props
  appType?: string;
  renderInline: boolean;
  eventService: EventService;
  metricsService: MetricsService;
  requestService: RequestService;
  onChallengeDisplayed: OnChallengeDisplayedCallback;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
  onModalChallengeAbandoned: OnModalChallengeAbandonedCallback | null;
};

const App: React.FC<Props> = ({
  challengeId,
  appType,
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
    <CaptchaV2ContextProvider
      challengeId={challengeId}
      appType={appType}
      renderInline={renderInline}
      eventService={eventService}
      metricsService={metricsService}
      requestService={requestService}
      onChallengeDisplayed={onChallengeDisplayed}
      onChallengeCompleted={onChallengeCompleted}
      onChallengeInvalidated={onChallengeInvalidated}
      onModalChallengeAbandoned={onModalChallengeAbandoned}
    >
      <CaptchaV2 />
    </CaptchaV2ContextProvider>
  );
};

export default App;
