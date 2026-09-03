import React, { useCallback, useRef, useState } from "react";
import { CollectionCarousel, CollectionItemSize } from "@rbx/discovery-sdui-components";
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
import { parseStringField, getSessionInfoKey } from "../utils/analyticsParsingUtils";
import { sendScrollEvent } from "../../common/utils/scrollEvent";
import { ScrollDirection } from "../../common/constants/eventStreamConstants";
import useResolveItemTemplateConfigs from "../hooks/useResolveItemTemplateConfigs";
import useLogCollectionImpressions from "../hooks/useLogCollectionImpressions";
import useWrapWithAnalyticsContext from "../hooks/useWrapWithAnalyticsContext";
import useWrapCollectionChildrenWithAnalyticsContext from "../hooks/useWrapCollectionChildrenWithAnalyticsContext";

type TSduiCollectionCarouselProps = {
  items?: TServerDrivenComponentConfig[];
  collectionItemSize?: CollectionItemSize;

  itemTemplateKey?: string;

  layoutOverrides?: {
    columnGap: number;
    sideMargin: number;
    numColumns: number;
    fractionalItemAmount: number;
  };

  scrollThresholdFromEnd?: number;
  onScrollToEnd?: () => void;

  headerComponent?: JSX.Element;

  // Arbitrary children parsed from the component config
  children?: React.ReactNode[];
} & TSduiCommonProps;

const SduiCollectionCarousel = ({
  sduiContext,
  analyticsContext,
  componentConfig,
  items,
  collectionItemSize,
  itemTemplateKey,
  layoutOverrides,
  scrollThresholdFromEnd,
  onScrollToEnd,
  headerComponent,
  children,
}: TSduiCollectionCarouselProps): JSX.Element => {
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

  const reportHorizontalScrollTelemetry = useCallback(
    (scrollDistance: number, startingPosition: number, scrollAreaSize: number) => {
      // Decremented since server collectionPosition will be 1-indexed for Lua
      const collectionPosition =
        collectionAnalyticsDataRef.current?.collectionPosition !== undefined &&
        collectionAnalyticsDataRef.current.collectionPosition >= 0
          ? collectionAnalyticsDataRef.current.collectionPosition - 1
          : -1;
      const sessionInfoKey = getSessionInfoKey(sduiContext.pageContext) ?? "";

      sendScrollEvent({
        distance: scrollDistance,
        scrollAreaSize,
        startingPosition,
        direction: ScrollDirection.Horizontal,
        gameSetTypeId: collectionAnalyticsDataRef.current?.collectionId ?? -1,
        gameSetTargetId: undefined,
        sortPosition: collectionPosition,
        currentPage: sduiContext.pageContext.pageName,
        pageSession: parseStringField(collectionAnalyticsDataRef.current?.[sessionInfoKey], ""),
      });
    },
    [collectionAnalyticsDataRef, sduiContext],
  );

  const renderItem = useCallback(
    (
      itemConfig: TServerDrivenComponentConfig,
      itemIndex: number,
      isVisible: boolean,
    ): JSX.Element => {
      if (!itemConfig) {
        logSduiError(
          SduiErrorNames.CollectionCarouselMissingItem,
          `CollectionCarousel with config ${JSON.stringify(
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
          SduiErrorNames.CollectionCarouselItemMissingComponentType,
          `CollectionCarousel with config ${JSON.stringify(
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
          extraLocalProps={{
            isOnScreen: isVisible,
          }}
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
      <CollectionCarousel<TServerDrivenComponentConfig>
        itemsContainerRef={itemsContainerRef}
        items={resolvedItemConfigs}
        renderItem={renderItem}
        collectionItemSize={collectionItemSize ?? CollectionItemSize.Small}
        updateItemsPerRow={setItemsPerRow}
        headerComponent={headerWithAnalyticsContext}
        layoutOverrides={layoutOverrides}
        gapBetweenHeaderAndItems={tokens.Gap.Large}
        isHorizontalScrollEnabled
        scrollArrowBackgroundColor={tokens.Color.Surface.Surface_100}
        scrollArrowBoxShadowColor={tokens.Color.Common.Shadow}
        thresholdFromEnd={scrollThresholdFromEnd}
        onReachedThresholdFromEnd={onScrollToEnd}
        reportHorizontalScrollTelemetry={reportHorizontalScrollTelemetry}
      />
      {childrenWithAnalyticsContext}
    </div>
  );
};

export default SduiCollectionCarousel;
