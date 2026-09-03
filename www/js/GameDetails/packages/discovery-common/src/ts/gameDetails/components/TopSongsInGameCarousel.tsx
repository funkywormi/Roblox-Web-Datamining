import { useMemo, type JSX } from "react";
import { Loading } from "@rbx/core-ui";
import { useTokens, WithTranslationsProps } from "@rbx/core-scripts/react";
import { ContentType } from "@rbx/unified-logging";
import { PageContext } from "../../common/types/pageContext";
import { FeatureGameDetails } from "../../common/constants/translationConstants";
import useSduiContext from "../../sdui/hooks/useSduiContext";
import { TServerDrivenComponentConfig } from "../../sdui/system/SduiTypes";
import { SduiRegisteredComponents } from "../../sdui/system/SduiComponentRegistry";
import SduiComponent from "../../sdui/system/SduiComponent";
import { SduiActionType } from "../../sdui/system/SduiActionParserRegistry";
import metadataConstants from "../constants/metadataConstants";
import useTopSongsInGame from "../../music/hooks/useTopSongsInGame";
import "../../../css/gameDetails/_topSongsInGame.scss";
import { TOP_SONGS_IN_GAME_OVERRIDES } from "../../music/constants";

// The position is hardcoded to 2 because it always shows up below the recommended games carousel (whose position is 1)
const TOP_SONGS_IN_GAME_COLLECTION_POSITION = 2;

export const TopSongsInGameCarousel = ({
  universeId,
  translate,
}: {
  translate: WithTranslationsProps["translate"];
  universeId: string;
}): JSX.Element | null => {
  const tokens = useTokens();
  const sduiContext = useSduiContext(undefined, PageContext.GameDetailPage);
  const { placeName = "" } = metadataConstants.metadataData() || {};
  const { data: songs = [], isLoading } = useTopSongsInGame(universeId);

  const titleText = translate(FeatureGameDetails.HeadingFeaturedSongs, {
    experienceName: placeName,
  });

  const items: TServerDrivenComponentConfig[] = useMemo(() => {
    return songs.map(song => ({
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
  }, [songs]);

  const componentConfig = useMemo(
    () => ({
      componentType: SduiRegisteredComponents.CollectionCarousel,
      analyticsData: {
        contentType: ContentType.Song,
        collectionPosition: TOP_SONGS_IN_GAME_COLLECTION_POSITION,
        collectionId: universeId,
      },
      props: {
        items,
        scrollingEnabledOverride: TOP_SONGS_IN_GAME_OVERRIDES.enableScrolling,
        collectionItemSize: "Small",
        layoutOverrides: {
          columnGap: TOP_SONGS_IN_GAME_OVERRIDES.columnGap,
        },
        headerComponent: {
          componentType: SduiRegisteredComponents.SectionHeader,
          props: {
            titleText,
            titleGap: tokens.Gap.XSmall,
          },
        },
      },
    }),
    [items, titleText, tokens.Gap.XSmall, universeId],
  );

  if (isLoading) {
    return <Loading />;
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="top-songs-in-game-carousel-container" data-testid="top-songs-in-game-carousel">
      <SduiComponent
        componentConfig={componentConfig}
        parentAnalyticsContext={{}}
        sduiContext={sduiContext}
      />
    </div>
  );
};

export default TopSongsInGameCarousel;
