import React from "react";
import { RequestService } from "../../../common/request";
import { GetMetadataReturnType } from "../../../common/request/types/captcha";
import CaptchaV2 from "./containers/captchaV2";
import {
  ActionType,
  OnChallengeCompletedCallback,
  OnChallengeDisplayedCallback,
  OnChallengeInvalidatedCallback,
  OnModalChallengeAbandonedCallback,
} from "./interface";
import { EventService } from "./services/eventService";
import { MetricsService } from "./services/metricsService";
import { CaptchaContextProvider } from "./store/contextProvider";

type Props = {
  actionType: ActionType;
  appType: string | null;
  dataExchangeBlob: string;
  unifiedCaptchaId: string;
  captchaVersion: string;
  renderInline: boolean;
  requestService: RequestService;
  metadataResponse: GetMetadataReturnType;
  eventService: EventService;
  metricsService: MetricsService;
  onChallengeDisplayed: OnChallengeDisplayedCallback;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
  onModalChallengeAbandoned: OnModalChallengeAbandonedCallback | null;
};

export const App: React.FC<Props> = ({
  actionType,
  appType,
  dataExchangeBlob,
  unifiedCaptchaId,
  captchaVersion,
  renderInline,
  requestService,
  metadataResponse,
  eventService,
  metricsService,
  onChallengeDisplayed,
  onChallengeCompleted,
  onChallengeInvalidated,
  onModalChallengeAbandoned,
}: Props) => {
  return (
    <CaptchaContextProvider
      actionType={actionType}
      appType={appType}
      dataExchangeBlob={dataExchangeBlob}
      unifiedCaptchaId={unifiedCaptchaId}
      captchaVersion={captchaVersion}
      renderInline={renderInline}
      requestService={requestService}
      metadataResponse={metadataResponse}
      eventService={eventService}
      metricsService={metricsService}
      onChallengeDisplayed={onChallengeDisplayed}
      onChallengeCompleted={onChallengeCompleted}
      onChallengeInvalidated={onChallengeInvalidated}
      onModalChallengeAbandoned={onModalChallengeAbandoned}
    >
      <CaptchaV2 />
    </CaptchaContextProvider>
  );
};

export default App;
