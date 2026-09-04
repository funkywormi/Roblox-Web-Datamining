import type { ComponentType } from "react";
import { UiComponentType, type SduiComponentDefinition } from "../types";
import { makeTokenOrLiteralPropParser } from "../parsers/propParsers";
import { SDUI_SECTION_HEADER_DEFAULTS } from "../consts/defaults";
import {
  SduiPageHeader,
  SduiVerticalFeed,
  SduiSectionHeader,
  SduiTextIconRow,
  SduiTileFooter,
  SduiAttributionRow,
  SduiBadge,
  SduiChip,
  SduiSkeleton,
  SduiButton,
  SduiView,
  SduiLogo,
  SduiFeedbackBanner,
  SduiSystemBanner,
  SduiDialog,
  SduiIcon,
  SduiIconButton,
  SduiLayeredContainer,
  SduiBackgroundBlur,
  SduiOverflowMenu,
} from "../components";

/**
 * Default isomorphic (SSR-safe) component definitions and their prop parsers.
 *
 * Each entry maps a `UiComponentType` to its leaf React component and any
 * parsers used to translate proto prop values into runtime values. Client
 * and server packages override entries with their environment-specific
 * implementations.
 *
 */
export const DEFAULT_COMPONENTS: Partial<Record<UiComponentType, SduiComponentDefinition>> = {
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
  [UiComponentType.PAGE_HEADER]: {
    component: SduiPageHeader,
    propParsers: {
      backgroundMaxWidth: makeTokenOrLiteralPropParser(),
      foregroundMaxWidth: makeTokenOrLiteralPropParser(),
      foregroundHorizontalPadding: makeTokenOrLiteralPropParser(),
      foregroundBottomPadding: makeTokenOrLiteralPropParser(24),
      foregroundTopPadding: makeTokenOrLiteralPropParser(0),
    },
  },
  [UiComponentType.TILE_FOOTER]: {
    component: SduiTileFooter,
    propParsers: {
      sectionGap: makeTokenOrLiteralPropParser("Gap.Small"),
      textIconGap: makeTokenOrLiteralPropParser("Gap.XSmall"),
      iconWidth: makeTokenOrLiteralPropParser(16),
    },
  },
  [UiComponentType.TEXT_ICON_ROW]: {
    component: SduiTextIconRow,
    propParsers: {
      gap: makeTokenOrLiteralPropParser(),
    },
  },
  [UiComponentType.SECTION_HEADER]: {
    component: SduiSectionHeader,
    propParsers: {
      verticalGap: makeTokenOrLiteralPropParser(SDUI_SECTION_HEADER_DEFAULTS.verticalGap),
      titleGap: makeTokenOrLiteralPropParser("Gap.XXSmall"),
    },
  },
  [UiComponentType.ATTRIBUTION_ROW]: {
    component: SduiAttributionRow,
  },
  [UiComponentType.BADGE]: {
    component: SduiBadge,
  },
  [UiComponentType.CHIP]: {
    component: SduiChip,
  },
  [UiComponentType.SKELETON]: {
    component: SduiSkeleton,
  },
  [UiComponentType.DIALOG]: {
    component: SduiDialog,
  },
  [UiComponentType.SYSTEM_BANNER]: {
    component: SduiSystemBanner,
  },
  [UiComponentType.FEEDBACK_BANNER]: {
    component: SduiFeedbackBanner,
  },
  [UiComponentType.BUTTON]: {
    component: SduiButton,
  },
  [UiComponentType.VIEW]: {
    component: SduiView,
    doesManageChildren: true,
    propParsers: {
      maxWidth: makeTokenOrLiteralPropParser(),
    },
  },
  [UiComponentType.LOGO]: {
    component: SduiLogo,
  },
  [UiComponentType.ICON]: {
    component: SduiIcon,
  },
  [UiComponentType.ICON_BUTTON]: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- SduiIconButton requires a named `ariaLabel: string` for accessibility, which the registry's widened `ComponentType<Record<string, unknown>>` prop type cannot express; the contract is enforced at the component's typed call sites.
    component: SduiIconButton as ComponentType<Record<string, unknown>>,
  },
  [UiComponentType.OVERFLOW_MENU]: {
    component: SduiOverflowMenu,
  },
  [UiComponentType.LAYERED_CONTAINER]: {
    component: SduiLayeredContainer,
    propParsers: {
      foregroundMaxWidth: makeTokenOrLiteralPropParser(),
      foregroundHorizontalPadding: makeTokenOrLiteralPropParser(),
      foregroundTopPadding: makeTokenOrLiteralPropParser(),
      foregroundBottomPadding: makeTokenOrLiteralPropParser(),
    },
  },
  [UiComponentType.BACKGROUND_BLUR]: {
    component: SduiBackgroundBlur,
  },
};
