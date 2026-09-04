import type { TranslateFunction } from "@rbx/core-scripts/react";
import type { SduiEntryPointMessages } from "@rbx/sdui-core/client";
import { FeatureSduiLandingPage } from "../../common/constants/translationConstants";

/** Localized strings for SDUI entry-point loading/error UI (matches V1 ErrorPage keys). */
export function buildSduiLandingPageEntryPointMessages(
  translate: TranslateFunction,
): SduiEntryPointMessages {
  return {
    loadingAriaLabel: translate(FeatureSduiLandingPage.LabelLoading),
    errorTitle: translate(FeatureSduiLandingPage.ErrorContentFetchTitle),
    errorDescription: translate(FeatureSduiLandingPage.ErrorContentFetchDescription),
    retryLabel: translate(FeatureSduiLandingPage.ActionRetry),
  };
}
