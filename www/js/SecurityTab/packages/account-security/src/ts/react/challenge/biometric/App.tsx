import React from "react";
import { WithTranslationsProps, withTranslations } from "react-utilities";
import { TRANSLATION_CONFIG } from "./app.config";
import BiometricV1 from "./containers/biometricV1";
import {
  OnChallengeCompletedCallback,
  OnChallengeDisplayedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback,
} from "./interface";
import { EventService } from "./services/eventService";
import { MetricsService } from "./services/metricsService";
import { BiometricContextProvider } from "./store/contextProvider";

type Props = {
  challengeId: string;
  biometricType: string;
  appType?: string;
  renderInline: boolean;
  eventService: EventService;
  metricsService: MetricsService;
  onChallengeDisplayed: OnChallengeDisplayedCallback;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
  onModalChallengeAbandoned: OnModalChallengeAbandonedCallback | null;
} & WithTranslationsProps;

export const App: React.FC<Props> = ({
  challengeId,
  biometricType,
  appType,
  renderInline,
  eventService,
  metricsService,
  translate,
  onChallengeDisplayed,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned,
}: Props) => {
  return (
    <BiometricContextProvider
      challengeId={challengeId}
      biometricType={biometricType}
      appType={appType}
      renderInline={renderInline}
      eventService={eventService}
      metricsService={metricsService}
      translate={translate}
      onChallengeDisplayed={onChallengeDisplayed}
      onChallengeCompleted={onChallengeCompleted}
      onChallengeInvalidated={onChallengeInvalidated}
      onModalChallengeAbandoned={onModalChallengeAbandoned}
    >
      <BiometricV1 />
    </BiometricContextProvider>
  );
};

export default withTranslations(App, TRANSLATION_CONFIG);
