import { useCallback, useMemo } from "react";
import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { userId } from "@rbx/core-scripts/meta/user";
import environmentUrls from "@rbx/environment-urls";
import ExperimentationService from "@rbx/experimentation";
import { translateHtml } from "@rbx/translation-utils";
import {
  createUniversalFeatureRestrictionsApi,
  type TranslateFn,
  type TranslateHtmlFn,
  type UniversalFeatureRestrictionsAnalyticsEvent,
  type UniversalFeatureRestrictionsConfig,
} from "@rbx/universal-feature-restrictions";
import { useLocale, useTranslations, type Namespace } from "@rbx/www-common/i18n";
import universalFeatureRestrictionsRequests from "../services/universalFeatureRestrictionsRequests";

const PLACEMENT = "WebAvatarEditor";

const api = createUniversalFeatureRestrictionsApi({
  ...universalFeatureRestrictionsRequests,
  userModerationApiUrl: environmentUrls.userModerationApi.replace(/\/$/, ""),
});

const sendAnalyticsEvent = (event: UniversalFeatureRestrictionsAnalyticsEvent): void => {
  sendEventWithTarget(
    event.name,
    event.context,
    {
      user_id: userId() ?? 0,
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

type LooseTranslator = {
  (key: string, values?: Record<string, string>): string;
  has: (key: string) => boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- valid at runtime via component.json and the Next.js page namespaces
const asNamespace = (name: string): Namespace => name as unknown as Namespace;

const useUniversalFeatureRestrictionsTranslate = (): TranslateFn => {
  // One call per namespace: rules-of-hooks forbids mapping over the list.
  const t0 = useTranslations(asNamespace("Feature.NotApproved"));
  const t1 = useTranslations(asNamespace("Feature.InExperienceIntervention"));
  const t2 = useTranslations(asNamespace("Feature.AppealsPortal"));
  const t3 = useTranslations(asNamespace("Feature.UniversalFeatureRestrictions"));

  return useMemo<TranslateFn>(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- string keys at runtime
    const translators = [t0, t1, t2, t3] as unknown as LooseTranslator[];
    return (key, params) => {
      const translator = translators.find(candidate => candidate.has(key));
      return translator ? translator(key, params) : "";
    };
  }, [t0, t1, t2, t3]);
};

const useUniversalFeatureRestrictionsConfig = (): UniversalFeatureRestrictionsConfig => {
  const translate = useUniversalFeatureRestrictionsTranslate();
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
