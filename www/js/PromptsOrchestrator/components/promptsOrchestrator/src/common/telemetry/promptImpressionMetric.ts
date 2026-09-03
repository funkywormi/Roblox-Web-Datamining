import type { SduiAnalyticsReporter } from "@rbx/sdui-core";
import type { AppPage } from "../constants/pageConstants";

type PromptImpressionMetricInput = {
  appPage: AppPage;
  modalId: string;
  modalType: string;
};

export const buildPromptImpressionMetric = ({
  appPage,
  modalId,
  modalType,
}: PromptImpressionMetricInput): Parameters<SduiAnalyticsReporter["logEvent"]> => [
  {
    name: "ModalImpression",
    type: "ModalImpression",
    context: appPage,
  },
  {
    modalId,
    modalType,
  },
];
