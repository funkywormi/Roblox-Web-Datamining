import { MutableRefObject, useCallback, useMemo, useRef } from "react";
import { TAnalyticsContext, TCollectionAnalyticsData, TSduiContext } from "../system/SduiTypes";
import { TSduiActionConfig } from "../system/SduiActionParserRegistry";
import reportActionAnalytics from "../system/reportActionAnalytics";
import { buildAndValidateCollectionAnalyticsData } from "../system/buildAnalyticsData";
import { SduiRegisteredComponents } from "../system/SduiComponentRegistry";
import { parseStringField } from "../utils/analyticsParsingUtils";

const useCollectionAnalyticsContext = (
  analyticsContext: TAnalyticsContext,
  collectionComponentType: keyof typeof SduiRegisteredComponents,
  itemsPerRow: number,
  totalNumberOfItems: number,
  sduiContext: TSduiContext,
): {
  collectionAnalyticsContext: TAnalyticsContext;
  collectionAnalyticsDataRef: MutableRefObject<TCollectionAnalyticsData | null>;
} => {
  const collectionAnalyticsDataRef = useRef<TCollectionAnalyticsData | null>(null);

  // Called while executing actions through parseCallback
  const logAction = useCallback(
    (actionConfig: TSduiActionConfig, actionAnalyticsContext: TAnalyticsContext) => {
      reportActionAnalytics(
        actionConfig,
        actionAnalyticsContext,
        sduiContext,
        collectionAnalyticsDataRef.current,
      );
    },
    [collectionAnalyticsDataRef, sduiContext],
  );

  const getCollectionAnalyticsData = useCallback(() => {
    return collectionAnalyticsDataRef.current;
  }, [collectionAnalyticsDataRef]);

  // Create an updated context that includes logAction and getCollectionData
  const collectionAnalyticsContext = useMemo(() => {
    return {
      ...analyticsContext,
      logAction,
      getCollectionAnalyticsData,
    };
  }, [analyticsContext, logAction, getCollectionAnalyticsData]);

  collectionAnalyticsDataRef.current = useMemo<TCollectionAnalyticsData>(() => {
    const analyticsCollectionComponentType = parseStringField(
      collectionAnalyticsContext.analyticsData?.collectionComponentType,
      collectionComponentType,
    );

    return buildAndValidateCollectionAnalyticsData(
      collectionAnalyticsContext.ancestorAnalyticsData ?? {},
      collectionAnalyticsContext.analyticsData ?? {},
      analyticsCollectionComponentType,
      itemsPerRow,
      totalNumberOfItems,
      sduiContext,
    );
  }, [
    collectionAnalyticsContext.ancestorAnalyticsData,
    collectionAnalyticsContext.analyticsData,
    collectionComponentType,
    itemsPerRow,
    totalNumberOfItems,
    sduiContext,
  ]);

  return {
    collectionAnalyticsContext,
    collectionAnalyticsDataRef,
  };
};

export default useCollectionAnalyticsContext;
