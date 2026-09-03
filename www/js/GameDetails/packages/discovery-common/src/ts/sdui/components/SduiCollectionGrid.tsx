import React, { useCallback, useRef, useState } from "react";
import { CollectionGrid, CollectionItemSize } from "@rbx/discovery-sdui-components";
import { useCollectionItemsIntersectionTracker } from "@rbx/unified-logging";
import {
  TItemAnalyticsData,
  TSduiCommonProps,
  TServerDrivenComponentConfig,
} from "../system/SduiTypes";
import SduiComponent from "../system/SduiComponent";
import logSduiError, { SduiErrorNames } from "../utils/logSduiError";
import useCollectionAnalyticsContext from "../hooks/useCollectionAnalyticsContext";
import { buildAndValidateItemAnalyticsData } from "../system/buildAnalyticsData";
import { parseStringField } from "../utils/analyticsParsingUtils";
import useResolveItemTemplateConfigs from "../hooks/useResolveItemTemplateConfigs";
import useLogCollectionImpressions from "../hooks/useLogCollectionImpressions";
import useWrapCollectionChildrenWithAnalyticsContext from "../hooks/useWrapCollectionChildrenWithAnalyticsContext";
import useWrapWithAnalyticsContext from "../hooks/useWrapWithAnalyticsContext";

type TSduiCollectionGridProps = {
  items?: TServerDrivenComponentConfig[];
  collectionItemSize?: CollectionItemSize;

  itemTemplateKey?: string;

  layoutOverrides?: {
    columnGap: number;
    sideMargin: number;
    numColumns: number;
    fractionalItemAmount: number;
  };

  headerComponent?: JSX.Element;

  // Arbitrary children parsed from the component config
  children?: React.ReactNode[];
} & TSduiCommonProps;

const SduiCollectionGrid = ({
  sduiContext,
  analyticsContext,
  componentConfig,
  items,
  collectionItemSize,
  itemTemplateKey,
  layoutOverrides,
  headerComponent,
  children,
}: TSduiCollectionGridProps): JSX.Element => {
  const { tokens } = sduiContext.dependencies;

  const resolvedItemConfigs = useResolveItemTemplateConfigs(sduiContext, items, itemTemplateKey);

  const itemAnalyticsDatasRef = useRef<TItemAnalyticsData[]>([]);

  const [itemsPerRow, setItemsPerRow] = useState<number>(-1);

  const { collectionAnalyticsContext, collectionAnalyticsDataRef } = useCollectionAnalyticsContext(
    analyticsContext,
    componentConfig.componentType,
    itemsPerRow,
    resolvedItemConfigs.length, // totalNumberOfItems
    sduiContext,
  );

  const { onItemsImpressed } = useLogCollectionImpressions(
    componentConfig,
    resolvedItemConfigs,
    itemAnalyticsDatasRef,
    collectionAnalyticsDataRef,
    sduiContext,
  );

  const itemsContainerRef = useRef<HTMLDivElement | null>(null);

  useCollectionItemsIntersectionTracker(
    itemsContainerRef,
    resolvedItemConfigs.length,
    onItemsImpressed,
  );

  const renderItem = useCallback(
    (itemConfig: TServerDrivenComponentConfig, itemIndex: number): JSX.Element => {
      if (!itemConfig) {
        logSduiError(
          SduiErrorNames.CollectionGridMissingItem,
          `CollectionGrid with config ${JSON.stringify(
            componentConfig,
          )} trying to render item ${JSON.stringify(itemConfig)} that is missing`,
          sduiContext.pageContext,
        );

        return <React.Fragment />;
      }

      const analyticsItemComponentType = parseStringField(
        itemConfig.analyticsData?.componentType,
        "",
      );

      const itemComponentType = analyticsItemComponentType || itemConfig.componentType;

      if (!itemComponentType) {
        logSduiError(
          SduiErrorNames.CollectionGridItemMissingComponentType,
          `CollectionGrid with config ${JSON.stringify(
            componentConfig,
          )} is missing item component type on item config ${JSON.stringify(itemConfig)}`,
          sduiContext.pageContext,
        );

        return <React.Fragment />;
      }

      const localAnalyticsData = {
        // incremented to match app
        itemPosition: itemIndex + 1,
        itemComponentType,
        componentType: itemComponentType,
      };

      itemAnalyticsDatasRef.current[itemIndex] = buildAndValidateItemAnalyticsData(
        itemConfig.analyticsData ?? {},
        {}, // For impressions, don't include collection analytics fields for each item
        localAnalyticsData,
        sduiContext,
      );

      return (
        <SduiComponent
          componentConfig={itemConfig}
          parentAnalyticsContext={collectionAnalyticsContext}
          sduiContext={sduiContext}
          localAnalyticsData={localAnalyticsData}
        />
      );
    },
    [sduiContext, componentConfig, collectionAnalyticsContext],
  );

  const headerWithAnalyticsContext = useWrapWithAnalyticsContext(
    collectionAnalyticsContext,
    headerComponent,
  );

  const childrenWithAnalyticsContext = useWrapCollectionChildrenWithAnalyticsContext(
    collectionAnalyticsContext,
    componentConfig,
    sduiContext,
    children,
  );

  return (
    <div>
      <CollectionGrid<TServerDrivenComponentConfig>
        itemsContainerRef={itemsContainerRef}
        items={resolvedItemConfigs}
        renderItem={renderItem}
        collectionItemSize={collectionItemSize ?? CollectionItemSize.Small}
        updateItemsPerRow={setItemsPerRow}
        headerComponent={headerWithAnalyticsContext}
        layoutOverrides={layoutOverrides}
        gapBetweenHeaderAndItems={tokens.Gap.Large}
      />
      {childrenWithAnalyticsContext}
    </div>
  );
};

export default SduiCollectionGrid;
