import React from "react";
import classNames from "classnames";
import {
  ThumbnailGameIconSize,
  ThumbnailAssetsSize,
  ThumbnailTypes,
  ThumbnailFormat,
  ThumbnailGameThumbnailSize,
  ThumbnailAvatarHeadshotSize,
} from "@rbx/thumbnails";
import {
  TTypographyToken,
  TUDim2,
  TAutomaticSize,
  TVector2,
  TGradient,
  TWebTextElement,
  WebTextElementValidSet,
} from "@rbx/discovery-sdui-components";
import { buttonSizes, buttonVariants, TButtonSize, TButtonVariant } from "@rbx/foundation-ui";
import { useTokens } from "@rbx/core-scripts/react";
import SduiComponent from "./SduiComponent";
import SduiAssetImage from "../components/SduiAssetImage";
import SduiThumbnailImage from "../components/SduiThumbnailImage";
import logSduiError, { SduiErrorNames } from "../utils/logSduiError";
import SduiActionParserRegistry, {
  TSduiActionConfig,
  TSduiParsedAction,
  TSduiParsedActionConfig,
} from "./SduiActionParserRegistry";
import {
  TAnalyticsContext,
  TAssetUrlData,
  TFoundationToken,
  THeroUnitAsset,
  TOmniRecommendationSduiTree,
  TRenderedSduiComponentConfig,
  TSduiContext,
  TSduiGradient,
  TServerDrivenComponentConfig,
  TUrlType,
} from "./SduiTypes";
import { getComponentFromType } from "./SduiComponentRegistry";
import reportActionAnalytics from "./reportActionAnalytics";

export const DEFAULT_GRADIENT: TGradient = {
  startColor: "#000000",
  endColor: "#000000",
  startTransparency: 0,
  endTransparency: 1,
  degree: 270,
};

const isValidSduiFeedItemArray = (input: unknown): input is TServerDrivenComponentConfig[] => {
  if (!Array.isArray(input)) {
    return false;
  }

  return input.every(item => typeof item === "object" && item !== null);
};

export const extractValidSduiFeedItem = (
  sduiRoot: TOmniRecommendationSduiTree | undefined,
  feedItemKey: string,
  sduiContext: TSduiContext,
): TServerDrivenComponentConfig | undefined => {
  if (sduiRoot === undefined || !isValidSduiFeedItemArray(sduiRoot?.feed?.props?.feedItems)) {
    logSduiError(
      SduiErrorNames.ServerDrivenFeedItemMissingFeedOrFeedItems,
      `SDUI missing feed items, root is ${JSON.stringify(sduiRoot)}`,
      sduiContext.pageContext,
    );

    return undefined;
  }

  const { feedItems } = sduiRoot.feed.props;

  const sduiFeedItem = feedItems.find(feedItem => feedItem.feedItemKey === feedItemKey);

  if (!sduiFeedItem) {
    logSduiError(
      SduiErrorNames.ServerDrivenFeedItemMissingItem,
      `SDUI feed items ${JSON.stringify(
        feedItems,
      )} missing matching feed item with key ${feedItemKey}`,
      sduiContext.pageContext,
    );

    return undefined;
  }

  return sduiFeedItem;
};

export const isValidParsedSduiComponentConfig = (
  input: unknown,
): input is TRenderedSduiComponentConfig => {
  if (input && typeof input === "object") {
    const componentConfig = input as TRenderedSduiComponentConfig;

    if (componentConfig.componentType && getComponentFromType(componentConfig.componentType)) {
      return true;
    }
  }

  return false;
};

export const parseUiComponent = (
  input: unknown,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): JSX.Element => {
  if (!input || typeof input !== "object") {
    logSduiError(
      SduiErrorNames.SduiParseUiComponentInvalidConfig,
      `Invalid component config ${JSON.stringify(input)} to parse UI component`,
      sduiContext.pageContext,
    );

    return <React.Fragment />;
  }

  const componentConfig = input as TServerDrivenComponentConfig;

  return (
    <SduiComponent
      componentConfig={componentConfig}
      parentAnalyticsContext={analyticsContext}
      sduiContext={sduiContext}
    />
  );
};

const isValidActionConfig = (input: unknown): input is TSduiActionConfig => {
  if (input && typeof input === "object") {
    const actionConfig = input as TSduiActionConfig;

    if (
      actionConfig.actionType &&
      actionConfig.actionParams &&
      SduiActionParserRegistry[actionConfig.actionType]
    ) {
      return true;
    }
  }

  return false;
};

const executeActionWithAnalytics = (
  parsedAction: TSduiParsedActionConfig,
  actionConfig: TSduiActionConfig,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
) => {
  const { logAction } = analyticsContext;

  if (logAction) {
    logAction(actionConfig, analyticsContext);
  } else {
    // Use default logAction if logAction from context is missing
    reportActionAnalytics(actionConfig, analyticsContext, sduiContext, null);
  }

  // Callback is optional, and may not exist for analytics-only use cases (like navigation links)
  if (parsedAction.callback) {
    parsedAction.callback();
  }
};

export const parseCallback = (
  input: unknown,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): TSduiParsedAction => {
  if (!isValidActionConfig(input)) {
    logSduiError(
      SduiErrorNames.SduiParseCallbackInvalidConfig,
      `Invalid action config ${JSON.stringify(input)} to parse callback`,
      sduiContext.pageContext,
    );

    return {
      onActivated: () => undefined,
      linkPath: undefined,
    };
  }

  const actionParser = SduiActionParserRegistry[input.actionType];

  const parsedAction = actionParser(input, analyticsContext, sduiContext);

  return {
    onActivated: () =>
      executeActionWithAnalytics(parsedAction, input, analyticsContext, sduiContext),
    linkPath: parsedAction.linkPath,
  };
};

const isValidHeroUnitAssetConfig = (input: unknown): input is THeroUnitAsset => {
  if (typeof input === "object") {
    const assetConfig = input as THeroUnitAsset;

    if (assetConfig.image && assetConfig.title && assetConfig.subtitle) {
      return true;
    }
  }

  return false;
};

export const parseAssetUrl = (
  input: unknown,
  _analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): TAssetUrlData => {
  if (typeof input !== "string") {
    logSduiError(
      SduiErrorNames.SduiParseAssetUrlInvalidInput,
      `Invalid asset url input ${JSON.stringify(input)}. Input must be a string.`,
      sduiContext.pageContext,
    );

    return {
      assetType: undefined,
      assetTarget: "0",
    };
  }

  const split = input.split("//");

  if (
    split.length === 2 &&
    (input.includes(TUrlType.RbxAsset) || input.includes(TUrlType.RbxThumb))
  ) {
    if (split[0]!.includes(TUrlType.RbxAsset)) {
      return {
        assetType: TUrlType.RbxAsset,
        assetTarget: split[1]!,
      };
    }
    if (split[0]!.includes(TUrlType.RbxThumb)) {
      return {
        assetType: TUrlType.RbxThumb,
        assetTarget: split[1]!,
      };
    }
  }

  // TODO https://roblox.atlassian.net/browse/CLIGROW-2206: Support direct CDN URLs for assets

  logSduiError(
    SduiErrorNames.SduiParseAssetUrlInvalidFormat,
    `Invalid asset url format ${input}`,
    sduiContext.pageContext,
  );

  return {
    assetType: undefined,
    assetTarget: "0",
  };
};

export const parseRbxThumbUrlData = (
  input: string,
): {
  thumbnailType: string | undefined;
  id: string | undefined;
  w: string | undefined;
  h: string | undefined;
} => {
  const split = input.split("&");

  const info: Record<string, string> = {};

  split.forEach(item => {
    const [key, value] = item.split("=");

    info[key!] = value!;
  });

  return {
    thumbnailType: info.type,
    id: info.id,
    w: info.w,
    h: info.h,
  };
};

export type TSupportedThumbnailSize =
  | ThumbnailGameIconSize
  | ThumbnailGameThumbnailSize
  | ThumbnailAssetsSize
  | ThumbnailAvatarHeadshotSize;

const thumbnailTypeToSizeMap: Record<string, TSupportedThumbnailSize[]> = {
  [ThumbnailTypes.gameIcon]: Object.values(ThumbnailGameIconSize),
  [ThumbnailTypes.gameThumbnail]: Object.values(ThumbnailGameThumbnailSize),
  [ThumbnailTypes.assetThumbnail]: Object.values(ThumbnailAssetsSize),
  [ThumbnailTypes.avatarHeadshot]: Object.values(ThumbnailAvatarHeadshotSize),
};

const getSupportedThumbnailSize = (
  thumbnailType: string,
  w: string,
  h: string,
): TSupportedThumbnailSize | undefined => {
  const thumbnailSize = `${w}x${h}`;

  return thumbnailTypeToSizeMap[thumbnailType]?.find(size => size === thumbnailSize);
};

export const parseAssetUrlIntoComponent = (
  input: unknown,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): JSX.Element | null => {
  if (typeof input !== "string") {
    return null;
  }

  const { assetType, assetTarget } = parseAssetUrl(input, analyticsContext, sduiContext);

  if (assetType === TUrlType.RbxAsset) {
    const id = assetTarget;

    return <SduiAssetImage assetId={id} sduiContext={sduiContext} />;
  }

  if (assetType === TUrlType.RbxThumb) {
    const { thumbnailType, id, w, h } = parseRbxThumbUrlData(assetTarget);

    if (id !== undefined && thumbnailType !== undefined && w !== undefined && h !== undefined) {
      const supportedSize = getSupportedThumbnailSize(thumbnailType, w, h);

      if (supportedSize !== undefined) {
        return (
          <SduiThumbnailImage
            thumbnailType={thumbnailType}
            targetId={id}
            format={ThumbnailFormat.webp}
            size={supportedSize}
          />
        );
      }

      logSduiError(
        SduiErrorNames.SduiParseAssetUrlIntoComponentNoSupportedThumbSizeForType,
        `No supported thumbnail size ${w}x${h} for type ${thumbnailType}`,
        sduiContext.pageContext,
      );

      return null;
    }

    logSduiError(
      SduiErrorNames.SduiParseAssetUrlIntoComponentInvalidRbxThumb,
      `Invalid rbxthumb url ${JSON.stringify(input)}. At least one of thumbnailType ${
        thumbnailType ?? "undefined"
      } id ${id ?? "undefined"}, w ${w ?? "undefined"}, or h ${h ?? "undefined"} is invalid`,
      sduiContext.pageContext,
    );

    return null;
  }

  logSduiError(
    SduiErrorNames.SduiParseAssetUrlIntoComponentInvalidAssetType,
    `Invalid asset type ${JSON.stringify(assetType)}. Only RbxThumb and RbxAsset are supported.`,
    sduiContext.pageContext,
  );

  return null;
};

const parseHeroUnitAsset = (
  input: unknown,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): THeroUnitAsset => {
  if (!isValidHeroUnitAssetConfig(input)) {
    // TODO https://roblox.atlassian.net/browse/CLIGROW-2200
    // Update default Hero Unit asset
    return {
      image: <React.Fragment />,
      title: "Hero Unit Asset Title",
      subtitle: "Hero Unit Asset Subtitle",
    };
  }

  const assetComponent = parseAssetUrlIntoComponent(input.image, analyticsContext, sduiContext);

  return {
    ...input,
    image: assetComponent,
  };
};

/**
 * @deprecated Use isValidGradient instead
 */
export const isValidSduiGradient = (input: unknown): input is TSduiGradient => {
  if (!input || typeof input !== "object") {
    return false;
  }

  const gradientConfig = input as TSduiGradient;

  if (!gradientConfig.startColor || typeof gradientConfig.startColor !== "string") {
    return false;
  }

  if (!gradientConfig.endColor || typeof gradientConfig.endColor !== "string") {
    return false;
  }

  if (
    gradientConfig.startOpacity === undefined ||
    typeof gradientConfig.startOpacity !== "number"
  ) {
    return false;
  }

  if (gradientConfig.endOpacity === undefined || typeof gradientConfig.endOpacity !== "number") {
    return false;
  }

  if (gradientConfig.degree === undefined || typeof gradientConfig.degree !== "number") {
    return false;
  }

  return true;
};

/**
 * Parses a foundation token string into either a string, number, or object result.
 *
 * Returns undefined and logs an error if the input is invalid or not found.
 */
export const parseFoundationTokenHelper = (
  input: unknown,
  allTokens: ReturnType<typeof useTokens>,
  _analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): TFoundationToken | undefined => {
  if (!allTokens) {
    logSduiError(
      SduiErrorNames.SduiParseFoundationTokenMissingTokens,
      `Missing tokens in parseFoundationTokenHelper for input ${JSON.stringify(input)}`,
      sduiContext.pageContext,
    );

    return undefined;
  }

  if (typeof input !== "string") {
    logSduiError(
      SduiErrorNames.SduiParseFoundationTokenInvalidInput,
      `Invalid input ${JSON.stringify(input)} for foundation token. Input must be a string.`,
      sduiContext.pageContext,
    );

    return undefined;
  }

  const splitInput = input.split(".");

  let currentToken: TFoundationToken = allTokens;

  for (let i = 0; i < splitInput.length; ++i) {
    const tokenPathStep = splitInput[i];

    // Verify the current token exists and can be indexed by tokenPathStep (object and not array)
    if (
      currentToken === undefined ||
      currentToken === null ||
      typeof currentToken !== "object" ||
      Array.isArray(currentToken)
    ) {
      logSduiError(
        SduiErrorNames.SduiParseFoundationTokenInvalidInputPath,
        `Invalid token path ${input}. Token path step ${tokenPathStep} is invalid. Token is ${JSON.stringify(
          currentToken,
        )}`,
        sduiContext.pageContext,
      );

      return undefined;
    }

    currentToken = currentToken[tokenPathStep!]!;
  }

  // Verify the final token is not null or undefined
  if (currentToken === null || currentToken === undefined) {
    logSduiError(
      SduiErrorNames.SduiParseFoundationTokenInvalidInputPath,
      `Invalid token path ${input}. The final token ${
        currentToken ? JSON.stringify(currentToken) : "undefined"
      } is invalid.`,
      sduiContext.pageContext,
    );

    return undefined;
  }

  return currentToken;
};

/**
 * Parses the input into a number.
 *
 * Supports direct number inputs and foundation number tokens.
 */
export const parseFoundationNumberToken = (
  input: unknown,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): number | undefined => {
  if (typeof input === "number") {
    return input;
  }

  const token = parseFoundationTokenHelper(
    input,
    sduiContext.dependencies.tokens,
    analyticsContext,
    sduiContext,
  );

  if (token === undefined || typeof token !== "number") {
    logSduiError(
      SduiErrorNames.SduiParseFoundationTokenInvalidOutputType,
      `Invalid output type ${typeof token} for token ${JSON.stringify(
        token,
      )} with input ${JSON.stringify(input)}. Expected number.`,
      sduiContext.pageContext,
    );

    return undefined;
  }

  return token;
};

const isValidTypographyToken = (input: unknown): input is TTypographyToken => {
  if (!input || typeof input !== "object") {
    return false;
  }

  return true;
};

/**
 * Parses the input into a typography token.
 *
 * Supports direct typography token objects and foundation typography tokens.
 */
export const parseFoundationTypographyToken = (
  input: unknown,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): TTypographyToken | undefined => {
  if (isValidTypographyToken(input)) {
    return input;
  }

  const token = parseFoundationTokenHelper(
    input,
    sduiContext.dependencies.tokens,
    analyticsContext,
    sduiContext,
  );

  if (token === undefined || !isValidTypographyToken(token)) {
    logSduiError(
      SduiErrorNames.SduiParseFoundationTokenInvalidOutputType,
      `Invalid output type ${typeof token}. Expected TypographyToken.`,
      sduiContext.pageContext,
    );

    return undefined;
  }

  return token;
};

export const parseFoundationStringToken = (
  input: unknown,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): string | undefined => {
  const token = parseFoundationTokenHelper(
    input,
    sduiContext.dependencies.tokens,
    analyticsContext,
    sduiContext,
  );

  if (token !== undefined && typeof token === "string") {
    return token;
  }

  logSduiError(
    SduiErrorNames.SduiParseFoundationTokenInvalidOutputType,
    `Invalid output type ${typeof token}. Expected string.`,
    sduiContext.pageContext,
  );

  return undefined;
};

export const isValidRgbColor = (input: unknown): input is string => {
  if (typeof input !== "string") {
    return false;
  }

  return /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/.test(input);
};

export const isValidRgbaColor = (input: unknown): input is string => {
  if (typeof input !== "string") {
    return false;
  }

  return /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d*(?:\.\d+)?)\s*\)$/.test(
    input,
  );
};

export const parseFoundationColorToken = (
  input: unknown,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): string | undefined => {
  if (isValidRgbColor(input) || isValidRgbaColor(input)) {
    return input;
  }

  const stringToken = parseFoundationStringToken(input, analyticsContext, sduiContext);

  if (stringToken && (isValidRgbColor(stringToken) || isValidRgbaColor(stringToken))) {
    return stringToken;
  }

  logSduiError(
    SduiErrorNames.SduiParseFoundationTokenInvalidOutputType,
    `Invalid output type ${typeof stringToken}. Expected color string.`,
    sduiContext.pageContext,
  );

  return undefined;
};

export const isValidHexColor = (input: unknown): input is string => {
  if (typeof input !== "string") {
    return false;
  }

  return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(input);
};

export const isValidHexColorWithoutHash = (input: unknown): input is string => {
  if (typeof input !== "string") {
    return false;
  }

  return /^([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(input);
};

/**
 * Parses the input into a hex, rgb, or rgba color string.
 *
 * Supports hex colors with or without a # prefix, rgb and rgba colors, and foundation color tokens.
 */
export const parseColorValue = (
  input: unknown,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): string | undefined => {
  if (isValidHexColor(input)) {
    return input;
  }

  if (isValidHexColorWithoutHash(input)) {
    return `#${input}`;
  }

  const colorToken = parseFoundationColorToken(input, analyticsContext, sduiContext);

  if (colorToken) {
    return colorToken;
  }

  logSduiError(
    SduiErrorNames.SduiParseColorValueInvalidInput,
    `Invalid input ${JSON.stringify(
      input,
    )} for color value. Input must be a hex color or a foundation color token.`,
    sduiContext.pageContext,
  );

  return undefined;
};

/**
 * Converts a rgb or rgba color string to a hex color string.
 *
 * Returns undefined and logs an error if the input is invalid.
 */
export const convertRbxColorToHex = (
  color: string,
  _analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): string | undefined => {
  if (!isValidRgbColor(color) && !isValidRgbaColor(color)) {
    logSduiError(
      SduiErrorNames.SduiParseColorValueInvalidInput,
      `Invalid input ${JSON.stringify(
        color,
      )} for color value in convertRbxColorToHex. Input must be a rgb or rgba color.`,
      sduiContext.pageContext,
    );
    return undefined;
  }
  // input is of type "rgb(247, 247, 248)" or "rgba(247, 247, 248, 0.5)"
  const rgbValues = color.match(/\d+(?:\.\d+)?/g);
  if (!rgbValues || rgbValues.length < 3 || rgbValues.length > 4) {
    logSduiError(
      SduiErrorNames.SduiParseColorValueInvalidInput,
      `Invalid input ${JSON.stringify(
        color,
      )} for color value in convertRbxColorToHex. Input must be a valid rgb or rgba color.`,
      sduiContext.pageContext,
    );
    return undefined; // Return undefined as fallback
  }

  const [r, g, b] = rgbValues.map(Number);
  return `#${r!.toString(16).padStart(2, "0")}${g!.toString(16).padStart(2, "0")}${b!
    .toString(16)
    .padStart(2, "0")}`;
};

/**
 * Parses the input into a 6-digit hex color string.
 *
 * Supports hex colors with or without a # prefix, rgb and rgba colors (ignoring the alpha value), and foundation color tokens.
 */
export const parseColorValueToHex = (
  input: unknown,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): string | undefined => {
  if (isValidHexColor(input)) {
    return input;
  }

  if (isValidHexColorWithoutHash(input)) {
    return `#${input}`;
  }

  if (isValidRgbColor(input) || isValidRgbaColor(input)) {
    return convertRbxColorToHex(input, analyticsContext, sduiContext);
  }

  const colorToken = parseFoundationColorToken(input, analyticsContext, sduiContext);

  if (colorToken) {
    return parseColorValueToHex(colorToken, analyticsContext, sduiContext);
  }

  logSduiError(
    SduiErrorNames.SduiParseColorValueInvalidInput,
    `Invalid input ${JSON.stringify(
      input,
    )} for color value in parseColorValueToHex. Input must be a hex color or a foundation color token.`,
    sduiContext.pageContext,
  );

  return undefined;
};

export const isValidGradient = (input: unknown): input is TGradient => {
  if (!input || typeof input !== "object") {
    return false;
  }

  const gradientConfig = input as TGradient;

  if (!gradientConfig.startColor || typeof gradientConfig.startColor !== "string") {
    return false;
  }

  if (!gradientConfig.endColor || typeof gradientConfig.endColor !== "string") {
    return false;
  }

  if (
    gradientConfig.startTransparency === undefined ||
    typeof gradientConfig.startTransparency !== "number" ||
    gradientConfig.startTransparency < 0 ||
    gradientConfig.startTransparency > 1
  ) {
    return false;
  }

  if (
    gradientConfig.endTransparency === undefined ||
    typeof gradientConfig.endTransparency !== "number" ||
    gradientConfig.endTransparency < 0 ||
    gradientConfig.endTransparency > 1
  ) {
    return false;
  }

  if (gradientConfig.degree === undefined || typeof gradientConfig.degree !== "number") {
    return false;
  }

  if (
    gradientConfig.widthPercent !== undefined &&
    (typeof gradientConfig.widthPercent !== "number" ||
      gradientConfig.widthPercent < 0 ||
      gradientConfig.widthPercent > 1)
  ) {
    return false;
  }

  if (
    gradientConfig.heightPercent !== undefined &&
    (typeof gradientConfig.heightPercent !== "number" ||
      gradientConfig.heightPercent < 0 ||
      gradientConfig.heightPercent > 1)
  ) {
    return false;
  }

  if (
    gradientConfig.midpointPercent !== undefined &&
    (typeof gradientConfig.midpointPercent !== "number" ||
      gradientConfig.midpointPercent < 0 ||
      gradientConfig.midpointPercent > 1)
  ) {
    return false;
  }

  return true;
};

export const parseGradient = (
  input: unknown,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): TGradient => {
  const isGradientV1 = isValidSduiGradient(input);
  const isGradientV2 = isValidGradient(input);

  if (!(isGradientV1 || isGradientV2)) {
    logSduiError(
      SduiErrorNames.SduiParseGradientInvalidConfig,
      `Invalid gradient config ${JSON.stringify(input)}`,
      sduiContext.pageContext,
    );
    return DEFAULT_GRADIENT;
  }

  let finalGradient: TGradient;

  if (isGradientV1) {
    // Convert deprecated gradient to TGradient format
    finalGradient = {
      startColor: (input as TSduiGradient).startColor,
      endColor: (input as TSduiGradient).endColor,
      startTransparency: (input as TSduiGradient).startOpacity,
      endTransparency: (input as TSduiGradient).endOpacity,
      degree: (input as TSduiGradient).degree,
    };
  } else {
    finalGradient = input as TGradient;
  }

  // Parse colors with fallback to defaults
  return {
    ...finalGradient,
    startColor:
      parseColorValueToHex(finalGradient.startColor, analyticsContext, sduiContext) ??
      DEFAULT_GRADIENT.startColor,
    endColor:
      parseColorValueToHex(finalGradient.endColor, analyticsContext, sduiContext) ??
      DEFAULT_GRADIENT.endColor,
  };
};

export const isValidUDim2 = (input: unknown): input is TUDim2 => {
  if (input && typeof input === "object") {
    const uDim2 = input as TUDim2;

    if (
      uDim2.xScale !== undefined &&
      typeof uDim2.xScale === "number" &&
      uDim2.xOffset !== undefined &&
      typeof uDim2.xOffset === "number" &&
      uDim2.yScale !== undefined &&
      typeof uDim2.yScale === "number" &&
      uDim2.yOffset !== undefined &&
      typeof uDim2.yOffset === "number"
    ) {
      return true;
    }
  }

  return false;
};

export const convertArrayToUDim2 = (input: unknown): TUDim2 | undefined => {
  if (input && Array.isArray(input) && input.length === 4) {
    const [xScale, xOffset, yScale, yOffset] = input.map(Number);

    return { xScale: xScale!, xOffset: xOffset!, yScale: yScale!, yOffset: yOffset! };
  }

  return undefined;
};

/**
 * Parse either a string with 4 comma-separated values or
 * an array of 4 numbers into a UDim2 object.
 *
 * Returns undefined and logs an error if the input is invalid.
 */
export const parseUDim2 = (
  input: unknown,
  _analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): TUDim2 | undefined => {
  if (isValidUDim2(input)) {
    return input;
  }

  const convertedInput = convertArrayToUDim2(input);

  if (isValidUDim2(convertedInput)) {
    return convertedInput;
  }

  if (!input || typeof input !== "string") {
    logSduiError(
      SduiErrorNames.SduiParseUDim2InvalidInput,
      `Invalid input ${JSON.stringify(input)} for uDim2. Input must be a string.`,
      sduiContext.pageContext,
    );

    return undefined;
  }

  const split = input.split(",");

  const convertedSplitInput = convertArrayToUDim2(split);

  if (isValidUDim2(convertedSplitInput)) {
    return convertedSplitInput;
  }

  logSduiError(
    SduiErrorNames.SduiParseUDim2InvalidInput,
    `Invalid input ${JSON.stringify(
      input,
    )} for uDim2. Input must be a string with 4 comma-separated values.`,
    sduiContext.pageContext,
  );

  return undefined;
};

export const isValidVector2 = (input: unknown): input is TVector2 => {
  if (input && typeof input === "object") {
    const vector2 = input as TVector2;

    if (
      vector2.x !== undefined &&
      typeof vector2.x === "number" &&
      vector2.y !== undefined &&
      typeof vector2.y === "number"
    ) {
      return true;
    }
  }

  return false;
};

export const convertArrayToVector2 = (input: unknown): TVector2 | undefined => {
  if (input && Array.isArray(input) && input.length === 2) {
    const [x, y] = input.map(Number);

    return { x: x!, y: y! };
  }

  return undefined;
};

/**
 * Parse either a string with 2 comma-separated values or
 * an array of 2 numbers into a Vector2 object.
 *
 * Returns undefined and logs an error if the input is invalid.
 */
export const parseVector2 = (
  input: unknown,
  _analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): TVector2 | undefined => {
  if (isValidVector2(input)) {
    return input;
  }

  const convertedInput = convertArrayToVector2(input);

  if (isValidVector2(convertedInput)) {
    return convertedInput;
  }

  if (!input || typeof input !== "string") {
    logSduiError(
      SduiErrorNames.SduiParseVector2InvalidInput,
      `Invalid input ${JSON.stringify(input)} for vector2. Input must be a string.`,
      sduiContext.pageContext,
    );

    return undefined;
  }

  const split = input.split(",");

  const convertedSplitInput = convertArrayToVector2(split);

  if (isValidVector2(convertedSplitInput)) {
    return convertedSplitInput;
  }

  logSduiError(
    SduiErrorNames.SduiParseVector2InvalidInput,
    `Invalid input ${JSON.stringify(
      input,
    )} for vector2. Input must be a string with 2 comma-separated values.`,
    sduiContext.pageContext,
  );

  return undefined;
};

/**
 * Parses the string input into a TAutomaticSize enum value.
 *
 * Returns undefined and logs an error if the input is invalid.
 */
export const parseAutomaticSize = (
  input: unknown,
  _analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): TAutomaticSize | undefined => {
  if (!input || typeof input !== "string") {
    logSduiError(
      SduiErrorNames.SduiParseAutomaticSizeInvalidInput,
      `Invalid input ${JSON.stringify(input)} for automatic size. Input must be a string.`,
      sduiContext.pageContext,
    );

    return undefined;
  }

  switch (input) {
    case TAutomaticSize.X:
      return TAutomaticSize.X;
    case TAutomaticSize.Y:
      return TAutomaticSize.Y;
    case TAutomaticSize.XY:
      return TAutomaticSize.XY;
    case TAutomaticSize.None:
      return TAutomaticSize.None;
    default: {
      logSduiError(
        SduiErrorNames.SduiParseAutomaticSizeInvalidInput,
        `Invalid automatic size ${JSON.stringify(input)}. Expected one of ${Object.values(
          TAutomaticSize,
        ).join(", ")}.`,
        sduiContext.pageContext,
      );
      return undefined;
    }
  }
};

/**
 * Validate that the input value is of type Record<string, unkown>, which is an object with string keys or an empty object.
 */
export const isStringKeyObject = (value: unknown): value is Record<string, unknown> => {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.keys(value).every(key => typeof key === "string")
  );
};

const supportedIcons: Record<string, string> = {
  "icons/status/games/rating_small": "icon-rating-16x16",
  "icons/status/games/people-playing_small": "icon-current-players-16x16",
  "icons/navigation/pushRight_small": "icon-push-right-16x16",
};

export const parseIcon = (
  input: unknown,
  _analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): string | undefined => {
  if (typeof input !== "string") {
    logSduiError(
      SduiErrorNames.SduiParseIconInvalidInput,
      `Invalid input ${JSON.stringify(input)} for icon. Input must be a string.`,
      sduiContext.pageContext,
    );
    return undefined;
  }

  if (!supportedIcons[input]) {
    logSduiError(
      SduiErrorNames.SduiParseIconInvalidInput,
      `Invalid icon ${JSON.stringify(input)}. Expected one of ${Object.keys(supportedIcons).join(
        ", ",
      )}.`,
      sduiContext.pageContext,
    );
    return undefined;
  }

  return classNames("sdui-icon", supportedIcons[input]);
};

export const parseFoundationButtonSize = (
  input: unknown,
  _analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): TButtonSize | undefined => {
  const buttonSizesArray = buttonSizes as readonly string[];
  if (typeof input !== "string" || !buttonSizesArray.includes(input)) {
    logSduiError(
      SduiErrorNames.SduiParseFoundationButtonSizeInvalidInput,
      `Invalid input ${JSON.stringify(
        input,
      )} for foundation button size. Input must be a valid string and button size.`,
      sduiContext.pageContext,
    );

    return undefined;
  }

  return input as TButtonSize;
};

export const parseFoundationButtonVariant = (
  input: unknown,
  _analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): TButtonVariant | undefined => {
  const buttonVariantsArray = buttonVariants as readonly string[];
  if (typeof input !== "string" || !buttonVariantsArray.includes(input)) {
    logSduiError(
      SduiErrorNames.SduiParseFoundationButtonVariantInvalidInput,
      `Invalid input ${JSON.stringify(
        input,
      )} for foundation button variant. Input must be a valid string and button variant.`,
      sduiContext.pageContext,
    );
    return undefined;
  }

  return input as TButtonVariant;
};

export const parseWebTextElement = (
  input: unknown,
  _analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): TWebTextElement | undefined => {
  if (typeof input !== "string" || !WebTextElementValidSet.has(input)) {
    logSduiError(
      SduiErrorNames.SduiParseWebTextElementInvalidInput,
      `Invalid input ${JSON.stringify(input)} for web text element. Input must be a valid string and web text element.`,
      sduiContext.pageContext,
    );
    return undefined;
  }

  return input as TWebTextElement;
};

export default {
  parseUiComponent,
  parseCallback,
  parseHeroUnitAsset,
  parseAssetUrl,
  parseAssetUrlIntoComponent,
  parseGradient,
  parseFoundationNumberToken,
  parseFoundationTypographyToken,
  parseColorValue,
  parseUDim2,
  parseVector2,
  parseAutomaticSize,
  parseIcon,
  parseFoundationButtonSize,
  parseFoundationButtonVariant,
  parseWebTextElement,
};
