import { isStringEnum } from "@rbx/core-lib";
import { TileBadgePositionEnum } from "../constants/genericTileConstants";
import {
  TGameTileBadgeComponentType,
  TGameTileBadgeType,
  TGameTileIconClass,
  TGameTilePillData,
  TGameTileRatingWithGenreFooter,
  TGameTileTextFooter,
  TLayoutComponentType,
  TLayoutMetadata,
  TTileBadge,
  TTileBadgesByPosition,
} from "../types/bedev1Types";

const hasEmptyValue = (value: string | undefined): value is "" | undefined =>
  value === undefined || value === "";

export const extractTileBadgesByPositionFromContentMetadata = (
  contentMetadata: Record<string, string> | undefined,
): TTileBadgesByPosition | undefined => {
  if (!contentMetadata) {
    return undefined;
  }

  const { badgePosition, badgeAnalyticsId, badgeType, badgeText, badgeIcon, badgeComponentType } =
    contentMetadata;

  if (
    hasEmptyValue(badgePosition) ||
    hasEmptyValue(badgeAnalyticsId) ||
    hasEmptyValue(badgeType) ||
    !isStringEnum(TGameTileBadgeType, badgeType)
  ) {
    return undefined;
  }

  return {
    [badgePosition]: [
      {
        analyticsId: badgeAnalyticsId,
        tileBadgeType: badgeType,
        text: badgeText,
        icons: badgeIcon ? [badgeIcon] : undefined,
        tileBadgeComponentType:
          !hasEmptyValue(badgeComponentType) &&
          isStringEnum(TGameTileBadgeComponentType, badgeComponentType)
            ? badgeComponentType
            : undefined,
      },
    ],
  };
};

export const getGameTilePillsIconClass = (icon: string): TGameTileIconClass | null => {
  switch (icon) {
    case "icons/menu/gem_small":
      return { class: "icon-gem-dark-stroke", type: "core-ui" };
    case "icons/menu/lock_closed":
      return { class: "icon-regular-lock-closed", type: "foundation" };
    default:
      return null;
  }
};

export const getGameTilePillsAnimationClass = (tileBadge: TTileBadge): string | null => {
  return tileBadge.isShimmerEnabled ? "shimmer-animation" : null;
};

export const getGameTilePillsPositionClass = (position: TileBadgePositionEnum): string => {
  switch (position) {
    case TileBadgePositionEnum.IMAGE_TOP_LEFT:
      return "game-card-pill-top-left";
    case TileBadgePositionEnum.IMAGE_TOP_RIGHT:
      return "game-card-pill-top-right";
    case TileBadgePositionEnum.IMAGE_BOTTOM_LEFT:
      return "game-card-pill-bottom-left";
    case TileBadgePositionEnum.IMAGE_BOTTOM_RIGHT:
      return "game-card-pill-bottom-right";
    default:
      return "";
  }
};

export type TGameTilesPillsByPosition = Partial<Record<TileBadgePositionEnum, TGameTilePillData[]>>;

const resolveIconClasses = (icons: string[] | undefined): TGameTileIconClass[] => {
  if (!icons) {
    return [];
  }
  return icons
    .map(icon => getGameTilePillsIconClass(icon))
    .filter((icon): icon is TGameTileIconClass => icon !== null);
};

const processBadges = (badges: TTileBadge[] | undefined): TGameTilePillData[] => {
  if (!badges?.length) {
    return [];
  }
  return badges
    .map((tileBadge): TGameTilePillData | undefined => {
      const badgeData: TGameTilePillData = {
        id: tileBadge.analyticsId,
        componentType: tileBadge.tileBadgeComponentType,
        animationClass: getGameTilePillsAnimationClass(tileBadge),
      };
      if (tileBadge.tileBadgeType === TGameTileBadgeType.Text && tileBadge.text) {
        badgeData.text = tileBadge.text;
      } else if (tileBadge.tileBadgeType === TGameTileBadgeType.Icon && tileBadge.icons) {
        badgeData.icons = resolveIconClasses(tileBadge.icons);
      } else if (
        tileBadge.tileBadgeType === TGameTileBadgeType.IconWithText &&
        tileBadge.icons &&
        tileBadge.text
      ) {
        badgeData.icons = resolveIconClasses(tileBadge.icons);
        badgeData.text = tileBadge.text;
      } else {
        return undefined;
      }
      return badgeData;
    })
    .filter((badgeData): badgeData is TGameTilePillData => badgeData !== undefined);
};

export const getGameTilePillsData = (
  gameLayoutData: TLayoutMetadata | undefined,
): TGameTilesPillsByPosition | null => {
  const validPillPositions = Object.values(TileBadgePositionEnum).filter(
    position => position !== TileBadgePositionEnum.INVALID,
  );

  const pillsByPosition: TGameTilesPillsByPosition = {};

  validPillPositions.forEach(position => {
    const badges = gameLayoutData?.tileBadgesByPosition?.[position as keyof TTileBadgesByPosition];
    const pillsData = processBadges(badges);
    if (pillsData.length) {
      pillsByPosition[position] = pillsData;
    }
  });

  return Object.keys(pillsByPosition).length > 0 ? pillsByPosition : null;
};

export const getGameTileTextFooterData = (
  gameLayoutData: TLayoutMetadata | undefined,
): TGameTileTextFooter | null => {
  return gameLayoutData?.footer?.type === TLayoutComponentType.TextLabel
    ? gameLayoutData.footer
    : null;
};

export const getGameTileRatingWithGenreFooterData = (
  gameLayoutData: TLayoutMetadata | undefined,
): TGameTileRatingWithGenreFooter | null => {
  const footer = gameLayoutData?.footer;
  if (footer?.type !== TLayoutComponentType.RatingWithGenre) {
    return null;
  }

  if (!footer.genre?.textLiteral) {
    return null;
  }

  return footer;
};

export default {
  extractTileBadgesByPositionFromContentMetadata,
  getGameTilePillsData,
  getGameTilePillsIconClass,
  getGameTilePillsAnimationClass,
  getGameTilePillsPositionClass,
  getGameTileRatingWithGenreFooterData,
  getGameTileTextFooterData,
};
