import { sendEvent } from "@rbx/core-scripts/event-stream";
import eventStreamConstants from "../../common/constants/eventStreamConstants";
import {
  isStringNumberOrBooleanValue,
  parseMaybeStringNumberField,
} from "../utils/analyticsParsingUtils";
import { buildGameImpressionParams } from "../utils/gameImpressionsParamsUtils";
import { SduiRegisteredComponents } from "./SduiComponentRegistry";
import {
  TCollectionAnalyticsData,
  TItemAnalyticsData,
  TSduiContext,
  TServerDrivenComponentConfig,
} from "./SduiTypes";
import { DUMMY_ITEM_DATA } from "./buildAnalyticsData";

// Returns true if the first item exists and is a 16:9 tile
const getUseGridTiles = (items: TServerDrivenComponentConfig[]): boolean => {
  const firstItem = items?.[0];

  if (
    firstItem?.componentType === SduiRegisteredComponents.Tile ||
    firstItem?.componentType === SduiRegisteredComponents.GameTile
  ) {
    const aspectRatio = firstItem.props?.imageAspectRatio;

    if (isStringNumberOrBooleanValue(aspectRatio)) {
      const parsedAspectRatio = parseMaybeStringNumberField(aspectRatio, 0);
      if (parsedAspectRatio > 1) {
        return true;
      }
    }
  }

  return false;
};

const sendGameImpressionsFromSdui = (
  indexesToSend: number[],
  itemAnalyticsDatas: TItemAnalyticsData[],
  items: TServerDrivenComponentConfig[],
  collectionAnalyticsData: TCollectionAnalyticsData,
  sduiContext: TSduiContext,
): void => {
  const useGridTiles = getUseGridTiles(items);

  const gameImpressionParams = buildGameImpressionParams({
    impressionIndexes: indexesToSend,
    itemAnalyticsDatas,
    collectionAnalyticsData,
    pageContext: sduiContext.pageContext,
    useGridTiles,
    componentTypeFallback: DUMMY_ITEM_DATA.itemComponentType,
  });

  const eventStreamParams = eventStreamConstants.gameImpressions(gameImpressionParams);
  sendEvent(...eventStreamParams);
};

export default sendGameImpressionsFromSdui;
