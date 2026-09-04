import { clsx } from "clsx";
import type { CSSProperties } from "react";
import type { SduiTokenOrLiteral } from "../../types";
import { buildSduiNumericStyle, buildSduiTokenClass } from "../../utils/styleValue";

/** Stable hook for surface styles targeting the sticky filter region (e.g. filter pill margins). */
export const SDUI_VERTICAL_FEED_STICKY_CLASS = "sdui-vertical-feed-sticky";

/** Matches lua SduiStickyHeader horizontal Divider / legacy `.sticky-header-sorts` border. */
export const SDUI_VERTICAL_FEED_STICKY_DIVIDER_BORDER = "1px solid var(--color-stroke-muted)";

/** Above tile SlotOverlay slot wrappers (z-index 10 in @rbx/discovery-sdui-components). */
export const SDUI_VERTICAL_FEED_STICKY_Z_INDEX = 11;

export type SduiStyleProps = {
  className?: string;
  style?: CSSProperties;
};

/** Feed column: row gap between entries; maxWidth applies when there is no sticky wrapper. */
export function buildFeedColumnStyles(
  gapBetweenFeedItems?: SduiTokenOrLiteral,
  maxWidth?: SduiTokenOrLiteral,
): SduiStyleProps {
  return {
    className: clsx(
      "flex",
      "flex-col",
      "width-full",
      buildSduiTokenClass(gapBetweenFeedItems, "gap"),
      buildSduiTokenClass(maxWidth, "maxWidth"),
    ),
    style: {
      ...buildSduiNumericStyle(gapBetweenFeedItems, gap => ({
        gap,
      })),
      ...buildSduiNumericStyle(maxWidth, maxWidthValue => ({
        maxWidth: maxWidthValue,
      })),
    } satisfies CSSProperties,
  };
}

interface GetVerticalFeedStylesParams {
  horizontalPadding?: SduiTokenOrLiteral;
  gapAfterStickyItems?: SduiTokenOrLiteral;
  gapBetweenStickyItems?: SduiTokenOrLiteral;
  stickyPaddingTop?: SduiTokenOrLiteral;
  stickyPaddingBottom?: SduiTokenOrLiteral;
  maxWidth?: SduiTokenOrLiteral;
}

export const getVerticalFeedStyles = ({
  horizontalPadding,
  gapAfterStickyItems,
  gapBetweenStickyItems,
  stickyPaddingTop,
  stickyPaddingBottom,
  maxWidth,
}: GetVerticalFeedStylesParams) => {
  return {
    containerStyles: {
      className: clsx("flex", "justify-center", buildSduiTokenClass(horizontalPadding, "paddingX")),
      style: {
        ...buildSduiNumericStyle(horizontalPadding, padding => ({
          paddingLeft: padding,
          paddingRight: padding,
        })),
      } satisfies CSSProperties,
    },
    /** Outer content column when sticky + feed are split (maxWidth only). */
    contentStyles: {
      className: clsx("flex", "flex-col", "width-full", buildSduiTokenClass(maxWidth, "maxWidth")),
      style: {
        ...buildSduiNumericStyle(maxWidth, maxWidthValue => ({
          maxWidth: maxWidthValue,
        })),
      } satisfies CSSProperties,
    },
    stickyStyles: {
      className: clsx(
        "flex",
        "flex-col",
        "width-full",
        SDUI_VERTICAL_FEED_STICKY_CLASS,
        buildSduiTokenClass(gapAfterStickyItems, "marginBottom"),
        buildSduiTokenClass(stickyPaddingTop, "paddingTop"),
      ),
      style: {
        position: "sticky",
        zIndex: SDUI_VERTICAL_FEED_STICKY_Z_INDEX,
        top: "var(--sdui-sticky-offset, 0px)",
        backgroundColor: "var(--color-surface-0)",
        borderBottom: SDUI_VERTICAL_FEED_STICKY_DIVIDER_BORDER,
        ...buildSduiNumericStyle(stickyPaddingTop, paddingTop =>
          paddingTop > 0 ? { paddingTop } : {},
        ),
        ...buildSduiNumericStyle(gapAfterStickyItems, marginBottom => ({
          marginBottom,
        })),
      } satisfies CSSProperties,
    },
    stickyItemsStyles: {
      className: clsx(
        "flex",
        "flex-col",
        "width-full",
        buildSduiTokenClass(gapBetweenStickyItems, "gap"),
        buildSduiTokenClass(stickyPaddingBottom, "paddingBottom"),
      ),
      style: {
        ...buildSduiNumericStyle(gapBetweenStickyItems, gap => ({
          gap,
        })),
        ...buildSduiNumericStyle(stickyPaddingBottom, paddingBottom => ({
          paddingBottom,
        })),
      } satisfies CSSProperties,
    },
  };
};
