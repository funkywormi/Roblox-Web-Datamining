import { MutableRefObject, useCallback } from "react";
import {
  TCollectionAnalyticsData,
  TItemAnalyticsData,
  TRenderedSduiComponentConfig,
  TSduiContext,
  TServerDrivenComponentConfig,
} from "../system/SduiTypes";
import logSduiError, { SduiErrorNames } from "../utils/logSduiError";
import sendGameImpressionsFromSdui from "../system/sendGameImpressionsFromSdui";
import reportImpressionAnalytics from "../system/reportImpressionAnalytics";

const useLogCollectionImpressions = (
  componentConfig: TRenderedSduiComponentConfig,
  resolvedItemConfigs: TServerDrivenComponentConfig[],
  itemAnalyticsDatasRef: MutableRefObject<TItemAnalyticsData[]>,
  collectionAnalyticsDataRef: MutableRefObject<TCollectionAnalyticsData | null>,
  sduiContext: TSduiContext,
): {
  onItemsImpressed: (indexesToSend: number[]) => void;
} => {
  const onItemsImpressed = useCallback(
    (indexesToSend: number[]) => {
      if (!resolvedItemConfigs) {
        logSduiError(
          SduiErrorNames.CollectionComponentItemsImpressedButMissing,
          `${componentConfig.componentType} with config ${JSON.stringify(
            componentConfig,
          )} is missing item configs on impression. Configs are ${JSON.stringify(
            resolvedItemConfigs,
          )}`,
          sduiContext.pageContext,
        );

        return;
      }

      if (collectionAnalyticsDataRef.current?.contentType === "Game") {
        sendGameImpressionsFromSdui(
          indexesToSend,
          itemAnalyticsDatasRef.current,
          resolvedItemConfigs,
          collectionAnalyticsDataRef.current,
          sduiContext,
        );
      }

      reportImpressionAnalytics(
        indexesToSend,
        itemAnalyticsDatasRef.current,
        collectionAnalyticsDataRef.current,
        sduiContext,
      );
    },
    [
      resolvedItemConfigs,
      collectionAnalyticsDataRef,
      itemAnalyticsDatasRef,
      sduiContext,
      componentConfig,
    ],
  );

  return {
    onItemsImpressed,
  };
};

export default useLogCollectionImpressions;
