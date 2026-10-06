import { useCallback, useMemo } from "react";
import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import environmentUrls from "@rbx/environment-urls";
import { useLocale } from "@rbx/www-common/i18n";
import ExperimentationService from "@rbx/experimentation";
import { translateHtml } from "@rbx/translation-utils";
import {
  createUniversalFeatureRestrictionsApi,
  type TranslateHtmlFn,
  type UniversalFeatureRestrictionsAnalyticsEvent,
  type UniversalFeatureRestrictionsConfig,
} from "@rbx/universal-feature-restrictions";
import chatHttpTransport from "../services/chatHttpTransport";
import { getCurrentUserId } from "../utils/currentUser";
import useChatTranslate from "./useChatTranslate";

const PLACEMENT = "Web";

const api = createUniversalFeatureRestrictionsApi({
  httpGet: <T>(url: string): Promise<T> => chatHttpTransport.get<T>({ url, withCredentials: true }),
  httpPost: async (url: string, body: object): Promise<void> => {
    await chatHttpTransport.post({ url, withCredentials: true }, body);
  },
  userModerationApiUrl: environmentUrls.userModerationApi,
});

const sendAnalyticsEvent = (event: UniversalFeatureRestrictionsAnalyticsEvent): void => {
  sendEventWithTarget(
    event.name,
    event.context,
    {
      user_id: getCurrentUserId() ?? 0,
      ...event.properties,
    },
    targetTypes.WWW,
  );
};

const ixp = {
  fetchLayer: (layerName: string) => ExperimentationService.getAllValuesForLayer(layerName),
  logExposure: (layerName: string) => {
    ExperimentationService.logLayerExposure(layerName);
  },
};

const useUniversalFeatureRestrictionsConfig = (): UniversalFeatureRestrictionsConfig => {
  const translate = useChatTranslate();
  const locale = useLocale();

  const translateHtmlAdapter = useCallback<TranslateHtmlFn>(
    (key, tags, args) => translateHtml(translate, key, tags, args),
    [translate],
  );

  return useMemo(
    () => ({
      translate,
      translateHtml: translateHtmlAdapter,
      api,
      sendAnalyticsEvent,
      websiteUrl: environmentUrls.websiteUrl,
      placement: PLACEMENT,
      locale,
      ixp,
    }),
    [locale, translate, translateHtmlAdapter],
  );
};

export default useUniversalFeatureRestrictionsConfig;
