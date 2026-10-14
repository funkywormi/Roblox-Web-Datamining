import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { TSduiActionConfig, TSduiParsedActionConfig } from "../SduiActionParserRegistry";
import { TAnalyticsContext } from "../SduiTypes";

const openMusicAssetParser = (
  actionConfig: TSduiActionConfig,
  _analyticsContext: TAnalyticsContext,
): TSduiParsedActionConfig => {
  const assetId = actionConfig.actionParams?.itemId as number | undefined;
  const songDetailsUrl = getAbsoluteUrl(`/music/${assetId}`);
  const openInNewTab = actionConfig.actionParams?.openInNewTab === true;

  return {
    linkPath: songDetailsUrl,
    openInNewTab,
  };
};

export default openMusicAssetParser;
