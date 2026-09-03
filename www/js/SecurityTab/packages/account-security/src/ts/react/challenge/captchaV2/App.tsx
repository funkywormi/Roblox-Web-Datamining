import React from "react";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { RequestService } from "../../../common/request";
import { TRANSLATION_CONFIG } from "./app.config";
import CaptchaV2 from "./containers/captchaV2";
import {
  CaptchaMode,
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
  // eslint-disable-next-line react/require-default-props
  mode?: CaptchaMode;
  renderInline: boolean;
  eventService: EventService;
  metricsService: MetricsService;
  requestService: RequestService;
  onChallengeDisplayed: OnChallengeDisplayedCallback;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
  onModalChallengeAbandoned: OnModalChallengeAbandonedCallback | null;
} & WithTranslationsProps;

export const App: React.FC<Props> = ({
  challengeId,
  appType,
  mode,
  renderInline,
  eventService,
  metricsService,
  requestService,
  translate,
  onChallengeDisplayed,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned,
}: Props) => {
  return (
    <CaptchaV2ContextProvider
      challengeId={challengeId}
      appType={appType}
      mode={mode}
      renderInline={renderInline}
      eventService={eventService}
      metricsService={metricsService}
      requestService={requestService}
      translate={translate}
      onChallengeDisplayed={onChallengeDisplayed}
      onChallengeCompleted={onChallengeCompleted}
      onChallengeInvalidated={onChallengeInvalidated}
      onModalChallengeAbandoned={onModalChallengeAbandoned}
    >
      <CaptchaV2 />
    </CaptchaV2ContextProvider>
  );
};

export default withTranslations(App, TRANSLATION_CONFIG);
