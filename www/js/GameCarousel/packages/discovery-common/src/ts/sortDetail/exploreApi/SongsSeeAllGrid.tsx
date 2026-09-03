import { useTokens } from "@rbx/core-scripts/react";
import React, { useMemo } from "react";
import { Loading } from "@rbx/core-ui";
import { CollectionItemSize } from "@rbx/discovery-sdui-components";
import { TExploreApiSongsSort } from "../../common/types/bedev2Types";
import { PageContext } from "../../common/types/pageContext";
import useVerticalScrollTracker from "../../common/components/useVerticalScrollTracker";
import SduiComponent from "../../sdui/system/SduiComponent";
import useSduiContext from "../../sdui/hooks/useSduiContext";
import { TServerDrivenComponentConfig } from "../../sdui/system/SduiTypes";
import { SduiRegisteredComponents } from "../../sdui/system/SduiComponentRegistry";
import SentinelTile from "../../common/components/SentinelTile";
import { SduiActionType } from "../../sdui/system/SduiActionParserRegistry";
import { buildSessionAnalyticsData } from "../../sdui/utils/analyticsParsingUtils";
import { usePageSession } from "../../common/utils/PageSessionContext";
import { ContentType } from "@rbx/unified-logging";

const SongsSeeAllGrid = ({
  sort,
  isFetching,
  currentPage,
  loadMoreData,
}: {
  sort: TExploreApiSongsSort;
  isFetching: boolean;
  currentPage: PageContext.SongListPage;
  loadMoreData: () => void;
}): JSX.Element => {
  const tokens = useTokens();
  const sduiContext = useSduiContext(undefined, currentPage);

  const pageSessionInfo = usePageSession();

  const localAnalyticsData = useMemo(() => {
    return buildSessionAnalyticsData(pageSessionInfo, sduiContext.pageContext);
  }, [pageSessionInfo, sduiContext]);

  useVerticalScrollTracker(currentPage);

  const items: TServerDrivenComponentConfig[] = useMemo(() => {
    return sort.songs.map(song => ({
      componentType: SduiRegisteredComponents.Tile,
      analyticsData: {
        id: song.assetId,
      },
      props: {
        imageAspectRatio: 1,
        titleText: song.title,
        imageComponent: {
          componentType: SduiRegisteredComponents.SongThumbnail,
          props: {
            assetId: song.assetId,
            width: 150,
            height: 150,
            altName: song.title,
          },
        },
        footerComponent: {
          componentType: SduiRegisteredComponents.TileFooter,
          props: {
            leftText: song.artist,
          },
        },
        onActivated: {
          actionType: SduiActionType.OpenSongDetails,
          actionParams: {
            itemId: song.assetId,
          },
        },
      },
    }));
  }, [sort.songs]);

  const componentConfig = useMemo(
    () => ({
      componentType: SduiRegisteredComponents.CollectionGrid,
      analyticsData: {
        contentType: ContentType.Song,
      },
      props: {
        items,
        layoutOverrides: {
          sideMargin: tokens.Gap.XLarge,
        },
        scrollingEnabledOverride: true,
        collectionItemSize: CollectionItemSize.Small,
        headerComponent: {
          componentType: SduiRegisteredComponents.SectionHeader,
          props: {
            titleText: sort.topic,
            titleGap: tokens.Gap.XSmall,
            subtitleText: sort.subtitle,
          },
        },
      },
    }),
    [items, sort.subtitle, sort.topic, tokens.Gap.XLarge, tokens.Gap.XSmall],
  );

  return (
    <div>
      <SduiComponent
        componentConfig={componentConfig}
        sduiContext={sduiContext}
        parentAnalyticsContext={{}}
        localAnalyticsData={localAnalyticsData}
      />
      <SentinelTile loadData={loadMoreData} />
      {isFetching && <Loading />}
    </div>
  );
};

export default SongsSeeAllGrid;
