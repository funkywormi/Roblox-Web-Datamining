import React, { useMemo, useRef } from "react";
import { useCollectionItemsIntersectionTracker } from "@rbx/unified-logging";
import SduiComponent from "../system/SduiComponent";
import logSduiError, { SduiErrorNames } from "../utils/logSduiError";
import {
  TItemAnalyticsData,
  TSduiCommonProps,
  TServerDrivenComponentConfig,
} from "../system/SduiTypes";
import { buildAndValidateItemAnalyticsData } from "../system/buildAnalyticsData";
import { parseStringField } from "../utils/analyticsParsingUtils";
import useCollectionAnalyticsContext from "../hooks/useCollectionAnalyticsContext";
import useResolveItemTemplateConfigs from "../hooks/useResolveItemTemplateConfigs";
import useLogCollectionImpressions from "../hooks/useLogCollectionImpressions";
import useWrapCollectionChildrenWithAnalyticsContext from "../hooks/useWrapCollectionChildrenWithAnalyticsContext";

type TSingleItemCollectionProps = {
  item: TServerDrivenComponentConfig | undefined;
  children?: React.ReactNode[];
} & TSduiCommonProps;

/**
 * Renders a collection with a single item using Server Driven UI
 * Also supports rendering arbitrary children below the item
 */
const SingleItemCollection = ({
  componentConfig,
  analyticsContext,
  sduiContext,
  item,
  children,
}: TSingleItemCollectionProps): JSX.Element => {
  const itemAnalyticsDatasRef = useRef<TItemAnalyticsData[]>([]);

  const resolvedItemConfigs = useResolveItemTemplateConfigs(
    sduiContext,
    item ? [item] : [],
    undefined,
  );

  const resolvedItemConfig = resolvedItemConfigs.length > 0 ? resolvedItemConfigs[0] : undefined;

  const { collectionAnalyticsContext, collectionAnalyticsDataRef } = useCollectionAnalyticsContext(
    analyticsContext,
    componentConfig.componentType,
    1, // itemsPerRow
    1, // totalNumberOfItems
    sduiContext,
  );

  const { onItemsImpressed } = useLogCollectionImpressions(
    componentConfig,
    resolvedItemConfigs,
    itemAnalyticsDatasRef,
    collectionAnalyticsDataRef,
    sduiContext,
  );

  const containerRef = useRef<HTMLDivElement | null>(null);

  useCollectionItemsIntersectionTracker(
    containerRef,
    1, // childrenLength
    onItemsImpressed,
  );

  const itemToRender = useMemo(() => {
    if (!resolvedItemConfig) {
      logSduiError(
        SduiErrorNames.SingleItemCollectionMissingItem,
        `SingleItemCollection missing item ${JSON.stringify(
          resolvedItemConfig,
        )} with config ${JSON.stringify(componentConfig)}`,
        sduiContext.pageContext,
      );

      return <React.Fragment />;
    }

    const analyticsItemComponentType = parseStringField(
      resolvedItemConfig.analyticsData?.componentType,
      "",
    );
    const itemComponentType = analyticsItemComponentType || resolvedItemConfig.componentType;

    if (!itemComponentType) {
      logSduiError(
        SduiErrorNames.SingleItemCollectionItemMissingItemComponentType,
        `SingleItemCollection missing item component type ${JSON.stringify(resolvedItemConfig)}`,
        sduiContext.pageContext,
      );

      return <React.Fragment />;
    }

    const itemIndex = 0;
    const localAnalyticsData = {
      // incremented to match app
      itemPosition: itemIndex + 1,
      itemComponentType,
      componentType: itemComponentType,
    };

    // Store in ref for use when logging impressions
    itemAnalyticsDatasRef.current[itemIndex] = buildAndValidateItemAnalyticsData(
      resolvedItemConfig.analyticsData ?? {},
      {}, // For impressions, don't include collection analytics fields for each item
      localAnalyticsData,
      sduiContext,
    );

    return (
      <SduiComponent
        componentConfig={resolvedItemConfig}
        parentAnalyticsContext={collectionAnalyticsContext}
        sduiContext={sduiContext}
        localAnalyticsData={localAnalyticsData}
      />
    );
  }, [resolvedItemConfig, componentConfig, collectionAnalyticsContext, sduiContext]);

  const childrenWithAnalyticsContext = useWrapCollectionChildrenWithAnalyticsContext(
    collectionAnalyticsContext,
    componentConfig,
    sduiContext,
    children,
  );

  return (
    <div ref={containerRef}>
      {itemToRender}
      {childrenWithAnalyticsContext}
    </div>
  );
};

export default SingleItemCollection;
