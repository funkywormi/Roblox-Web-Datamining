import React from "react";
import { RequestService } from "../../../common/request";
import ProofOfWork from "./containers/proofOfWork";
import {
  OnChallengeDisplayedCallback,
  OnChallengeCompletedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback,
} from "./interface";
import { EventService } from "./services/eventService";
import { MetricsService } from "./services/metricsService";
import { ProofOfWorkContextProvider } from "./store/contextProvider";

type Props = {
  sessionId: string;
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
  sessionId,
  renderInline,
  eventService,
  metricsService,
  requestService,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChallengeDisplayed,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned,
}: Props) => {
  return (
    <ProofOfWorkContextProvider
      sessionId={sessionId}
      renderInline={renderInline}
      eventService={eventService}
      metricsService={metricsService}
      requestService={requestService}
      onChallengeDisplayed={onChallengeDisplayed}
      onChallengeCompleted={onChallengeCompleted}
      onChallengeInvalidated={onChallengeInvalidated}
      onModalChallengeAbandoned={onModalChallengeAbandoned}
    >
      <ProofOfWork />
    </ProofOfWorkContextProvider>
  );
};

export default App;
