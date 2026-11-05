import type { SduiImpressionHandlerConfig } from "@rbx/sdui-core";
import { sendSafetyResourceBannerImpressionOnce } from "../../../common/utils/safetyResourceBanner";

export const safetyResourceBannerImpressionsHandler: SduiImpressionHandlerConfig["handler"] = (
  ctx,
  impressionIndexes,
  itemAnalyticsDatas,
) => {
  for (const index of impressionIndexes) {
    const fields = itemAnalyticsDatas[index];
    if (!fields) continue;
    const { moderationCategory, url, surface, textFilterRequestId } = fields;
    if (
      typeof moderationCategory !== "string" ||
      typeof url !== "string" ||
      typeof surface !== "string" ||
      typeof textFilterRequestId !== "string"
    ) {
      console.error("SafetyResourceBannerEventInvalidInterface");
      continue;
    }
    sendSafetyResourceBannerImpressionOnce(
      { moderationCategory, url, surface, textFilterRequestId },
      ctx.pageContext.appPage,
    );
  }
};
