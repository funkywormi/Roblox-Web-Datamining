import {
  ImageWithGradient as SduiImageWithGradient,
  Page as PageComponent,
  DetailsPageHeader as DetailsPageHeaderComponent,
} from "@rbx/discovery-sdui-components";
import HeroUnitComponent from "../components/HeroUnit";
import SduiHeroUnitBottomRow from "../components/SduiHeroUnitBottomRow";
import SduiCollectionCarousel from "../components/SduiCollectionCarousel";
import SduiCollectionGrid from "../components/SduiCollectionGrid";
import GameTileComponent from "../components/SduiGameTile";
import GameTileActiveFriendsFooterComponent from "../components/SduiGameTileActiveFriendsFooter";
import PlayButtonComponent from "../components/SduiPlayButton";
import SectionHeaderComponent from "../components/SduiSectionHeader";
import SlotOverlayComponent from "../components/SduiSlotOverlay";
import TextIconRowComponent from "../components/SduiTextIconRow";
import TileComponent from "../components/SduiTile";
import TileFooterComponent from "../components/SduiTileFooter";
import SingleItemCollectionComponent from "../components/SingleItemCollection";
import SduiParsers from "./SduiParsers";
import { TSduiPropParserObject } from "./SduiTypes";
import wrapComponentForSdui, { TSduiComponentWrapperProps } from "./wrapComponentForSdui";
import SduiButton from "../components/SduiButton";
import SduiVerticalFeed from "../components/SduiVerticalFeed";
import SduiAttributionRow from "../components/SduiAttributionRow";
import SduiTextPill from "../components/SduiTextPill";
import SduiText from "../components/SduiText";
import SduiWebText from "../components/SduiWebText";
import SduiSongThumbnail from "../components/SduiSongThumbnail";

export enum SduiRegisteredComponents {
  SingleItemCollection = "SingleItemCollection",
  HeroUnit = "HeroUnit",
  HeroUnitBottomRow = "HeroUnitBottomRow",
  PlayButton = "PlayButton",
  SongThumbnail = "SongThumbnail",
  TextIconRow = "TextIconRow",
  TileFooter = "TileFooter",
  GameTileActiveFriendsFooter = "GameTileActiveFriendsFooter",
  Tile = "Tile",
  GameTile = "GameTile",
  SectionHeader = "SectionHeader",
  SlotOverlay = "SlotOverlay",
  CollectionCarousel = "CollectionCarousel",
  CollectionGrid = "CollectionGrid",
  ImageWithGradient = "ImageWithGradient",
  Button = "Button",
  VerticalFeed = "VerticalFeed",
  Page = "Page",
  DetailsPageHeader = "DetailsPageHeader",
  AttributionRow = "AttributionRow",
  TextPill = "TextPill",
  Text = "Text",
  WebText = "WebText",
}

type TSduiComponentInfo = {
  component: React.ComponentType<TSduiComponentWrapperProps>;
  propParsers?: TSduiPropParserObject;
};

// Maps component type to component and prop parsers
export const SduiComponentMapping: Record<
  keyof typeof SduiRegisteredComponents,
  TSduiComponentInfo
> = {
  [SduiRegisteredComponents.SingleItemCollection]: {
    component: wrapComponentForSdui(SingleItemCollectionComponent),
    propParsers: {},
  },
  [SduiRegisteredComponents.PlayButton]: {
    component: wrapComponentForSdui(PlayButtonComponent),
    propParsers: {},
  },
  [SduiRegisteredComponents.SongThumbnail]: {
    component: wrapComponentForSdui(SduiSongThumbnail),
    propParsers: {},
  },
  [SduiRegisteredComponents.HeroUnit]: {
    component: wrapComponentForSdui(HeroUnitComponent),
    propParsers: {
      backgroundComponent: SduiParsers.parseUiComponent,
      bottomRowComponent: SduiParsers.parseUiComponent,
      ctaButtonComponent: SduiParsers.parseUiComponent,
      headerComponent: SduiParsers.parseUiComponent,
      onActivated: SduiParsers.parseCallback,
      overlayComponent: SduiParsers.parseUiComponent,
      asset: SduiParsers.parseHeroUnitAsset,
      gradient: SduiParsers.parseGradient,
      foregroundImage: SduiParsers.parseAssetUrlIntoComponent,
      backgroundImage: SduiParsers.parseAssetUrlIntoComponent,
      titleImage: SduiParsers.parseAssetUrlIntoComponent,
    },
  },
  [SduiRegisteredComponents.HeroUnitBottomRow]: {
    component: wrapComponentForSdui(SduiHeroUnitBottomRow),
    propParsers: {
      ctaButton: SduiParsers.parseUiComponent,
      rightLabelContent: SduiParsers.parseUiComponent,
      anchorPoint: SduiParsers.parseVector2,
      automaticSize: SduiParsers.parseAutomaticSize,
      size: SduiParsers.parseUDim2,
      position: SduiParsers.parseUDim2,
    },
  },
  [SduiRegisteredComponents.TextIconRow]: {
    component: wrapComponentForSdui(TextIconRowComponent),
    propParsers: {
      anchorPoint: SduiParsers.parseVector2,
      automaticSize: SduiParsers.parseAutomaticSize,
      size: SduiParsers.parseUDim2,
      position: SduiParsers.parseUDim2,
      onActivated: SduiParsers.parseCallback,
      textColor: SduiParsers.parseColorValue,
      fontStyle: SduiParsers.parseFoundationTypographyToken,
      webTextElement: SduiParsers.parseWebTextElement,
      gap: SduiParsers.parseFoundationNumberToken,
      icon: SduiParsers.parseIcon,
      iconWidth: SduiParsers.parseFoundationNumberToken,
      iconColor: SduiParsers.parseColorValue,
    },
  },
  [SduiRegisteredComponents.TileFooter]: {
    component: wrapComponentForSdui(TileFooterComponent),
    propParsers: {
      onActivated: SduiParsers.parseCallback,

      textColor: SduiParsers.parseColorValue,
      fontStyle: SduiParsers.parseFoundationTypographyToken,

      textIconGap: SduiParsers.parseFoundationNumberToken,
      sectionGap: SduiParsers.parseFoundationNumberToken,

      leftIcon: SduiParsers.parseIcon,
      leftIconComponent: SduiParsers.parseUiComponent,

      rightIcon: SduiParsers.parseIcon,
      rightIconComponent: SduiParsers.parseUiComponent,

      leftWebTextElement: SduiParsers.parseWebTextElement,
      rightWebTextElement: SduiParsers.parseWebTextElement,
    },
  },
  [SduiRegisteredComponents.GameTileActiveFriendsFooter]: {
    component: wrapComponentForSdui(GameTileActiveFriendsFooterComponent),
    propParsers: {
      iconWidth: SduiParsers.parseFoundationNumberToken,
      onActivated: SduiParsers.parseCallback,
    },
  },
  [SduiRegisteredComponents.Tile]: {
    component: wrapComponentForSdui(TileComponent),
    propParsers: {
      image: SduiParsers.parseAssetUrlIntoComponent,
      imageComponent: SduiParsers.parseUiComponent,
      thumbnailOverlayComponent: SduiParsers.parseUiComponent,
      onActivated: SduiParsers.parseCallback,
      titleColor: SduiParsers.parseColorValue,
      titleFont: SduiParsers.parseFoundationTypographyToken,
      titleWebTextElement: SduiParsers.parseWebTextElement,
      titleComponent: SduiParsers.parseUiComponent,
      containmentPadding: SduiParsers.parseFoundationNumberToken,
      cornerRadius: SduiParsers.parseFoundationNumberToken,
      footerComponent: SduiParsers.parseUiComponent,
      ctaButtonComponent: SduiParsers.parseUiComponent,
    },
  },
  [SduiRegisteredComponents.GameTile]: {
    component: wrapComponentForSdui(GameTileComponent),
    propParsers: {
      image: SduiParsers.parseAssetUrlIntoComponent,
      imageComponent: SduiParsers.parseUiComponent,
      thumbnailOverlayComponent: SduiParsers.parseUiComponent,
      onActivated: SduiParsers.parseCallback,
      titleColor: SduiParsers.parseColorValue,
      titleFont: SduiParsers.parseFoundationTypographyToken,
      titleComponent: SduiParsers.parseUiComponent,
      containmentPadding: SduiParsers.parseFoundationNumberToken,
      cornerRadius: SduiParsers.parseFoundationNumberToken,
      footerComponent: SduiParsers.parseUiComponent,
      ctaButtonComponent: SduiParsers.parseUiComponent,
    },
  },
  [SduiRegisteredComponents.SectionHeader]: {
    component: wrapComponentForSdui(SectionHeaderComponent),
    propParsers: {
      anchorPoint: SduiParsers.parseVector2,
      automaticSize: SduiParsers.parseAutomaticSize,
      size: SduiParsers.parseUDim2,
      position: SduiParsers.parseUDim2,
      onTitleActivated: SduiParsers.parseCallback,
      titleColor: SduiParsers.parseColorValue,
      titleFontStyle: SduiParsers.parseFoundationTypographyToken,
      titleGap: SduiParsers.parseFoundationNumberToken,
      titleIcon: SduiParsers.parseIcon,
      titleIconWidth: SduiParsers.parseFoundationNumberToken,
      titleWebTextElement: SduiParsers.parseWebTextElement,
      titleComponent: SduiParsers.parseUiComponent,
      onSubtitleActivated: SduiParsers.parseCallback,
      subtitleColor: SduiParsers.parseColorValue,
      subtitleFontStyle: SduiParsers.parseFoundationTypographyToken,
      subtitleGap: SduiParsers.parseFoundationNumberToken,
      subtitleIcon: SduiParsers.parseIcon,
      subtitleIconWidth: SduiParsers.parseFoundationNumberToken,
      subtitleWebTextElement: SduiParsers.parseWebTextElement,
      subtitleComponent: SduiParsers.parseUiComponent,
      verticalGap: SduiParsers.parseFoundationNumberToken,
      onInfoIconActivated: SduiParsers.parseCallback,
      iconComponent: SduiParsers.parseUiComponent,
    },
  },
  [SduiRegisteredComponents.SlotOverlay]: {
    component: wrapComponentForSdui(SlotOverlayComponent),
    propParsers: {
      anchorPoint: SduiParsers.parseVector2,
      automaticSize: SduiParsers.parseAutomaticSize,
      size: SduiParsers.parseUDim2,
      position: SduiParsers.parseUDim2,
      topLeftSlot: SduiParsers.parseUiComponent,
      topMiddleSlot: SduiParsers.parseUiComponent,
      topRightSlot: SduiParsers.parseUiComponent,
      centerLeftSlot: SduiParsers.parseUiComponent,
      centerMiddleSlot: SduiParsers.parseUiComponent,
      centerRightSlot: SduiParsers.parseUiComponent,
      bottomLeftSlot: SduiParsers.parseUiComponent,
      bottomMiddleSlot: SduiParsers.parseUiComponent,
      bottomRightSlot: SduiParsers.parseUiComponent,
      padding: SduiParsers.parseFoundationNumberToken,
    },
  },
  [SduiRegisteredComponents.CollectionCarousel]: {
    component: wrapComponentForSdui(SduiCollectionCarousel),
    propParsers: {
      layoutOverrides: {
        columnGap: SduiParsers.parseFoundationNumberToken,
        sideMargin: SduiParsers.parseFoundationNumberToken,
      },
      onScrollToEnd: SduiParsers.parseCallback,
      headerComponent: SduiParsers.parseUiComponent,
    },
  },
  [SduiRegisteredComponents.CollectionGrid]: {
    component: wrapComponentForSdui(SduiCollectionGrid),
    propParsers: {
      layoutOverrides: {
        columnGap: SduiParsers.parseFoundationNumberToken,
        sideMargin: SduiParsers.parseFoundationNumberToken,
      },
      headerComponent: SduiParsers.parseUiComponent,
    },
  },
  [SduiRegisteredComponents.ImageWithGradient]: {
    component: wrapComponentForSdui(SduiImageWithGradient),
    propParsers: {
      image: SduiParsers.parseAssetUrlIntoComponent,
      gradient: SduiParsers.parseGradient,
    },
  },
  [SduiRegisteredComponents.Button]: {
    component: wrapComponentForSdui(SduiButton),
    propParsers: {
      onActivated: SduiParsers.parseCallback,
      size: SduiParsers.parseFoundationButtonSize,
      variant: SduiParsers.parseFoundationButtonVariant,
    },
  },
  [SduiRegisteredComponents.Page]: {
    component: wrapComponentForSdui(PageComponent),
    propParsers: {
      backgroundColor: SduiParsers.parseColorValue,
      pageHeader: SduiParsers.parseUiComponent,
      feed: SduiParsers.parseUiComponent,
    },
  },
  [SduiRegisteredComponents.DetailsPageHeader]: {
    component: wrapComponentForSdui(DetailsPageHeaderComponent),
    propParsers: {
      backgroundComponent: SduiParsers.parseUiComponent,
      backgroundMaxWidth: SduiParsers.parseFoundationNumberToken,
      contentComponent: SduiParsers.parseUiComponent,
      contentMaxWidth: SduiParsers.parseFoundationNumberToken,
      paddingLeft: SduiParsers.parseFoundationNumberToken,
      paddingRight: SduiParsers.parseFoundationNumberToken,
    },
  },
  [SduiRegisteredComponents.VerticalFeed]: {
    component: wrapComponentForSdui(SduiVerticalFeed),
    propParsers: {
      gapBetweenFeedItems: SduiParsers.parseFoundationNumberToken,
      maxWidth: SduiParsers.parseFoundationNumberToken,
      paddingLeft: SduiParsers.parseFoundationNumberToken,
      paddingRight: SduiParsers.parseFoundationNumberToken,
    },
  },
  [SduiRegisteredComponents.AttributionRow]: {
    component: wrapComponentForSdui(SduiAttributionRow),
    propParsers: {
      rightButtonContent: SduiParsers.parseUiComponent,
      image: SduiParsers.parseAssetUrlIntoComponent,
      titleFontStyle: SduiParsers.parseFoundationTypographyToken,
      subtitleFontStyle: SduiParsers.parseFoundationTypographyToken,
      titleWebTextElement: SduiParsers.parseWebTextElement,
      subtitleWebTextElement: SduiParsers.parseWebTextElement,
      titleSubtitleGap: SduiParsers.parseFoundationNumberToken,
      height: SduiParsers.parseFoundationNumberToken,
    },
  },
  [SduiRegisteredComponents.TextPill]: {
    component: wrapComponentForSdui(SduiTextPill),
    propParsers: {
      anchorPoint: SduiParsers.parseVector2,
      automaticSize: SduiParsers.parseAutomaticSize,
      size: SduiParsers.parseUDim2,
      position: SduiParsers.parseUDim2,
      textColor: SduiParsers.parseColorValue,
      fontStyle: SduiParsers.parseFoundationTypographyToken,
      backgroundColor: SduiParsers.parseColorValue,
    },
  },
  [SduiRegisteredComponents.Text]: {
    component: wrapComponentForSdui(SduiText),
    propParsers: {
      textFontStyle: SduiParsers.parseFoundationTypographyToken,
      textColor: SduiParsers.parseColorValue,
    },
  },
  [SduiRegisteredComponents.WebText]: {
    component: wrapComponentForSdui(SduiWebText),
    propParsers: {
      textFontStyle: SduiParsers.parseFoundationTypographyToken,
      textColor: SduiParsers.parseColorValue,
      webTextElement: SduiParsers.parseWebTextElement,
    },
  },
};

/**
 * Returns component for a given component type, or null
 *
 * Error logging for missing components is handled by the caller
 */
export const getComponentFromType = (
  componentType: keyof typeof SduiRegisteredComponents,
): React.ComponentType<TSduiComponentWrapperProps> | null => {
  if (SduiComponentMapping[componentType]) {
    return SduiComponentMapping[componentType].component;
  }

  return null;
};

export default {
  getComponentFromType,
};
