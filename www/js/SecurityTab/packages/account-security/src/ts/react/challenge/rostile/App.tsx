import React from "react";
import { RequestService } from "../../../common/request";
import Rostile from "./containers/rostile";
import {
  OnChallengeDisplayedCallback,
  OnChallengeCompletedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback,
  PuzzleType,
} from "./interface";
import { EventService } from "./services/eventService";
import { MetricsService } from "./services/metricsService";
import { RostileContextProvider } from "./store/contextProvider";

type Props = {
  challengeId: string;
  puzzleType: PuzzleType;
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
  puzzleType,
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
    <RostileContextProvider
      challengeId={challengeId}
      puzzleType={puzzleType}
      renderInline={renderInline}
      eventService={eventService}
      metricsService={metricsService}
      requestService={requestService}
      onChallengeDisplayed={onChallengeDisplayed}
      onChallengeCompleted={onChallengeCompleted}
      onChallengeInvalidated={onChallengeInvalidated}
      onModalChallengeAbandoned={onModalChallengeAbandoned}
    >
      <Rostile />
    </RostileContextProvider>
  );
};

export default App;
