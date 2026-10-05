import type { TranslateFunction } from "@rbx/core-scripts/react";
import type { SduiEntryPointMessages } from "@rbx/sdui-core/client";
import configConstants from "../../common/constants/configConstants";
import {
  CommonGameSorts,
  FeatureSduiLandingPage,
} from "../../common/constants/translationConstants";

const { errorContainer } = configConstants;

const DEFAULT_LOADING_ARIA_LABEL = "Loading";
const DEFAULT_ERROR_TITLE = "Something went wrong";
const DEFAULT_ERROR_DESCRIPTION = "Please try again.";
const DEFAULT_RETRY_LABEL = "Retry";

/** Localized strings for Charts SDUI entry-point loading/error UI (legacy ErrorContainer parity). */
export function buildChartsPageEntryPointMessages(
  translate: TranslateFunction,
): SduiEntryPointMessages {
  return {
    loadingAriaLabel: translate(FeatureSduiLandingPage.LabelLoading) || DEFAULT_LOADING_ARIA_LABEL,
    errorTitle: translate(errorContainer.somethingWentWrongText) || DEFAULT_ERROR_TITLE,
    errorDescription: translate(CommonGameSorts.LabelApiError) || DEFAULT_ERROR_DESCRIPTION,
    retryLabel: translate(errorContainer.retryText) || DEFAULT_RETRY_LABEL,
  };
}
