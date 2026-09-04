import {
  UiComponentType,
  makeTokenOrLiteralPropParser,
  type SduiComponentDefinition,
} from "@rbx/sdui-core";
import { SduiCard } from "../components/SduiCard";
import { SduiCollectionCarousel } from "../components/SduiCollectionCarouselWrapper";
import { SduiCollectionGrid } from "../components/SduiCollectionGridWrapper";
import { SduiGameTile } from "../components/SduiGameTile";
import { SduiImage } from "../components/SduiImage";
import { SduiText } from "../components/SduiText";
import { SduiDownloadButton } from "../components/SduiDownloadButton";
import { SduiDialog } from "../components/SduiDialog";
import { SduiVideoPlayer } from "../components/sduiVideoPlayer/SduiVideoPlayer";
import { SduiVerticalFeed } from "../components/SduiVerticalFeedWrapper";

/**
 * Client component contributions.
 *
 * Each entry maps a `UiComponentType` to its client-only React component.
 * The application composition root decides which other modules to combine
 * with these definitions.
 */
export const DEFAULT_CLIENT_COMPONENTS: Partial<Record<UiComponentType, SduiComponentDefinition>> =
  {
    [UiComponentType.APP_DOWNLOAD_BUTTON]: {
      component: SduiDownloadButton,
    },
    [UiComponentType.DIALOG]: {
      component: SduiDialog,
      propParsers: {
        imageStyle: makeTokenOrLiteralPropParser(),
      },
    },
    [UiComponentType.TEXT]: {
      component: SduiText,
    },
    [UiComponentType.COLLECTION_CAROUSEL]: {
      component: SduiCollectionCarousel,
      doesManageChildren: true,
    },
    [UiComponentType.COLLECTION_GRID]: {
      component: SduiCollectionGrid,
      doesManageChildren: true,
    },
    [UiComponentType.VERTICAL_FEED]: {
      component: SduiVerticalFeed,
      doesManageChildren: true,
      propParsers: {
        horizontalPadding: makeTokenOrLiteralPropParser(),
        gapBetweenFeedItems: makeTokenOrLiteralPropParser(),
        gapAfterStickyItems: makeTokenOrLiteralPropParser(),
        gapBetweenStickyItems: makeTokenOrLiteralPropParser(),
        stickyPaddingTop: makeTokenOrLiteralPropParser(),
        stickyPaddingBottom: makeTokenOrLiteralPropParser(),
        maxWidth: makeTokenOrLiteralPropParser(),
      },
    },
    [UiComponentType.IMAGE]: {
      component: SduiImage,
      propParsers: {
        imageStyle: makeTokenOrLiteralPropParser(),
      },
    },
    [UiComponentType.CARD]: {
      component: SduiCard,
      propParsers: {
        // ColorStyleProp / token path (e.g. "Color.Surface.Surface_100") or a
        // raw CSS color string — normalized before the leaf sees it.
        backgroundStyle: makeTokenOrLiteralPropParser(),
        // CardSchema `Int32Prop corner_radius` (px) or a Radius.* token; default
        // matches Lua `tokens.Radius.Medium` when the template omits it.
        cornerRadius: makeTokenOrLiteralPropParser("Radius.Medium"),
      },
    },
    [UiComponentType.GAME_TILE]: {
      component: SduiGameTile,
      propParsers: {
        cornerRadius: makeTokenOrLiteralPropParser("Radius.Medium"),
      },
    },
    [UiComponentType.VIDEO_PLAYER]: {
      component: SduiVideoPlayer,
    },
  };
