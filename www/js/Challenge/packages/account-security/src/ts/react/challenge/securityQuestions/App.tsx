import React from "react";
import { RequestService } from "../../../common/request";
import SecurityQuestions from "./containers/securityQuestions";
import {
  OnChallengeCompletedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback,
} from "./interface";
import { EventService } from "./services/eventService";
import { MetricsService } from "./services/metricsService";
import { SecurityQuestionsContextProvider } from "./store/contextProvider";

type Props = {
  userId: string;
  sessionId: string;
  renderInline: boolean;
  eventService: EventService;
  metricsService: MetricsService;
  requestService: RequestService;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
  onModalChallengeAbandoned: OnModalChallengeAbandonedCallback | null;
};

export const App: React.FC<Props> = ({
  userId,
  sessionId,
  renderInline,
  eventService,
  metricsService,
  requestService,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned,
}: Props) => {
  return (
    <SecurityQuestionsContextProvider
      userId={userId}
      sessionId={sessionId}
      renderInline={renderInline}
      eventService={eventService}
      metricsService={metricsService}
      requestService={requestService}
      onChallengeCompleted={onChallengeCompleted}
      onChallengeInvalidated={onChallengeInvalidated}
      onModalChallengeAbandoned={onModalChallengeAbandoned}
    >
      <SecurityQuestions />
    </SecurityQuestionsContextProvider>
  );
};

export default App;
