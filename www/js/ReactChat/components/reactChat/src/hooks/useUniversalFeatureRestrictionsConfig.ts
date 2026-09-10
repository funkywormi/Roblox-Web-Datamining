import { useCallback, useMemo } from "react";
import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { get, post } from "@rbx/core-scripts/http";
import { useTranslation } from "@rbx/core-scripts/react";
import environmentUrls from "@rbx/environment-urls";
import ExperimentationService from "@rbx/experimentation";
import { translateHtml } from "@rbx/translation-utils";
import {
  createUniversalFeatureRestrictionsApi,
  type TranslateHtmlFn,
  type UniversalFeatureRestrictionsAnalyticsEvent,
  type UniversalFeatureRestrictionsConfig,
} from "@rbx/universal-feature-restrictions";
import { getCurrentUserId } from "../utils/currentUser";

const PLACEMENT = "Web";

const api = createUniversalFeatureRestrictionsApi({
  httpGet: async <T>(url: string): Promise<T> => {
    const response = await get<T>({ url, withCredentials: true });
    return response.data;
  },
  httpPost: async (url: string, body: object): Promise<void> => {
    await post({ url, withCredentials: true }, body);
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
  const { translate, intl } = useTranslation();

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
      locale: intl.locale,
      ixp,
    }),
    [intl.locale, translate, translateHtmlAdapter],
  );
};

export default useUniversalFeatureRestrictionsConfig;
