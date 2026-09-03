import { useTokens } from "@rbx/core-scripts/react";
import { TSduiActionConfig } from "./SduiActionParserRegistry";
import { SduiRegisteredComponents } from "./SduiComponentRegistry";
import { PageContext } from "../../common/types/pageContext";

export type TAnalyticsData = Record<string, string | number | boolean>;

export type TSduiResponsiveConfig = {
  overrides: Record<string, unknown>;
  conditions?: Record<string, unknown>;
};

export enum SduiResponsiveConditionKey {
  imageQualityLevel = "imageQualityLevel",
  maxScreenWidth = "maxScreenWidth",
  minScreenWidth = "minScreenWidth",
}

export enum SduiPresenceConditionKey {
  friendInGame = "friendInGame",
}

type TSduiConditionKey = SduiResponsiveConditionKey | SduiPresenceConditionKey;

export type TSduiConditionalPropConditions = {
  [key in TSduiConditionKey]?: unknown;
};

export type TSduiConditionalPropSet = {
  propOverrides: Record<string, unknown>;

  conditions?: TSduiConditionalPropConditions;
};

export type TServerDrivenComponentConfig = {
  componentType?: keyof typeof SduiRegisteredComponents;

  props: Record<string, unknown>;

  templateKey?: string;

  analyticsData?: TAnalyticsData;

  feedItemKey?: string;

  children?: TServerDrivenComponentConfig[];

  responsiveProps?: TSduiResponsiveConfig[];

  conditionalProps?: TSduiConditionalPropSet[];
};

// The componentType field must exist after rendering the component,
// since that is how we know which component to render.
export type TRenderedSduiComponentConfig = TServerDrivenComponentConfig & {
  componentType: keyof typeof SduiRegisteredComponents;
};

export type TOmniRecommendationSduiTree = {
  feed: TServerDrivenComponentConfig;

  templates?: Record<string, TServerDrivenComponentConfig>;
};

export type TSduiPageResponseData = {
  sduiRoot: TServerDrivenComponentConfig;
  templates?: Record<string, TServerDrivenComponentConfig>;
};

export interface TCollectionAnalyticsData extends TAnalyticsData {
  collectionId: number;
  contentType: string;
  itemsPerRow: number;
  collectionPosition: number;
  totalNumberOfItems: number;
  collectionComponentType: string;
}

export interface TItemAnalyticsData extends TAnalyticsData {
  id: string;
  itemPosition: number;
  itemComponentType: string;
}

export type TAnalyticsContext = {
  analyticsData?: TAnalyticsData;

  ancestorAnalyticsData?: TAnalyticsData;

  getCollectionData?: () => TCollectionAnalyticsData;

  logAction?: (actionConfig: TSduiActionConfig, analyticsContext: TAnalyticsContext) => void;
};

export type TSduiContextDependencies = {
  tokens: ReturnType<typeof useTokens>;
};

export type TSduiTemplateRegistry = {
  resolveTemplateForConfig: (
    componentConfig: TServerDrivenComponentConfig,
    seenTemplates?: Record<string, boolean>,
  ) => TServerDrivenComponentConfig;
};

export type TSduiFriendPresenceData = {
  userId: number;
  displayName: string;
  presence: {
    gameId: string | undefined;
    placeId: number | undefined;
    rootPlaceId: number | undefined;
  };
};

export type TSduiInGameFriendsByUniverseId = Record<string, TSduiFriendPresenceData[]>;

export type TSduiSocialData = {
  inGameFriendsByUniverseId: TSduiInGameFriendsByUniverseId;
};

export type TSduiDataStore = {
  social: TSduiSocialData;
};

export type TSduiPageContextType =
  | PageContext.HomePage
  | PageContext.GamesPage
  | PageContext.SpotlightPage
  | PageContext.SortDetailPageDiscover
  | PageContext.SongListPage
  | PageContext.GameDetailPage
  | PageContext.PreAuthLandingPage;

export type TSduiPageContext = {
  pageName: TSduiPageContextType;
};

export type TSduiContext = {
  dependencies: TSduiContextDependencies;

  templateRegistry: TSduiTemplateRegistry;

  dataStore: TSduiDataStore;

  pageContext: TSduiPageContext;
};

// Expected props to be shared by all components after prop parsing
export interface TSduiCommonProps {
  componentConfig: TRenderedSduiComponentConfig;

  analyticsContext: TAnalyticsContext;

  sduiContext: TSduiContext;
}

type TSduiPropParser = (
  value: unknown,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
) => unknown;

// Recursive definition to support nested prop parsers
export interface TSduiPropParserObject {
  [key: string]: TSduiPropParser | TSduiPropParserObject;
}

// Prop parsing types
export type THeroUnitAsset = {
  image: React.ReactNode;
  title: string;
  subtitle: string;
};

export enum TUrlType {
  RbxAsset = "rbxassetid",
  RbxThumb = "rbxthumb",
}

export type TAssetUrlData = {
  assetType: TUrlType | undefined;
  assetTarget: string;
};

interface TNestedFoundationToken {
  [key: string]: TNestedFoundationToken | string | number | number[];
}

export type TFoundationToken = TNestedFoundationToken | string | number | number[];

/**
 * @deprecated Use TGradient instead
 */
export type TSduiGradient = {
  startColor: string;
  endColor: string;
  startOpacity: number;
  endOpacity: number;
  degree: number;
};
