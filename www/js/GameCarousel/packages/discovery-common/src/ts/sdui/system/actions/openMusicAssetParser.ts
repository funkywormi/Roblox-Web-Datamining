import { getAbsoluteUrl } from "@rbx/core-scripts/util/url";
import { TSduiActionConfig, TSduiParsedActionConfig } from "../SduiActionParserRegistry";
import { TAnalyticsContext } from "../SduiTypes";

const openMusicAssetParser = (
  actionConfig: TSduiActionConfig,
  _analyticsContext: TAnalyticsContext,
): TSduiParsedActionConfig => {
  const assetId = actionConfig.actionParams?.itemId as number | undefined;

  return {
    linkPath: getAbsoluteUrl(`/music/${assetId}`),
  };
};

export default openMusicAssetParser;
