import type { ComponentType, Key, ReactElement } from "react";
import { ActionType } from "@rbx/service-contracts-proto/roblox/apppageplatform/shared/v1beta1/actions_pb.js";
import {
  UiComponentType,
  UiComponentTypeSchema,
} from "@rbx/service-contracts-proto/roblox/apppageplatform/shared/v1beta1/ui_component_type_pb.js";
import { AnalyticsContext, SduiAnalyticsReporter, SduiPageContext } from "./analytics";
import { SduiApiStore } from "./api";
import { PropParserContext, PropValidator, SduiComponentConfig, SduiDataBinder } from "./binding";
import { SduiErrorReporter } from "./error";
import { DataStatus } from "./hydration";

// ─── Proto Enum Re-exports ───

export {
  ActionType,
  ActionTypeSchema,
} from "@rbx/service-contracts-proto/roblox/apppageplatform/shared/v1beta1/actions_pb.js";
export {
  HydrationContentType,
  HydrationContentTypeSchema,
} from "@rbx/service-contracts-proto/roblox/apppageplatform/shared/v1beta1/hydration_content_type_pb.js";
export { ComparisonCondition_Op as ComparisonConditionOp } from "@rbx/service-contracts-proto/roblox/apppageplatform/shared/v1beta1/prop_condition_pb.js";
export type { TranslationRef } from "@rbx/service-contracts-proto/roblox/apppageplatform/shared/v1beta1/prop_types_pb.js";
export {
  ScaleBasis,
  ScaleBasisSchema,
} from "@rbx/service-contracts-proto/roblox/apppageplatform/shared/v1beta1/prop_types_pb.js";
export {
  AutomaticSizeSchema,
  ScaleTypeSchema,
  TextTruncateSchema,
} from "@rbx/service-contracts-proto/roblox/apppageplatform/shared/v1beta1/prop_types_engine_pb.js";
export { UiComponentType, UiComponentTypeSchema };
export type {
  FilterPillsInputData,
  FilterPillsInputData_FilterGroup as FilterPillsInputDataFilterGroup,
  FilterPillsInputData_FilterOption as FilterPillsInputDataFilterOption,
} from "@rbx/service-contracts-proto/roblox/apppageplatform/shared/v1beta1/page_entry_content_pb.js";

export { DataStatus, NOT_READY_READ, READY_UNDEFINED_READ } from "./hydration";
export type {
  EntityData,
  HydrationContent,
  HydrationRead,
  HydrationStore,
  HydrationStoreMap,
} from "./hydration";

export type {
  AnalyticsContext,
  AnalyticsFieldMap,
  CollectionAnalyticsData,
  ItemAnalyticsData,
  SduiAnalyticsReporter,
  SduiEventDescriptor,
  SduiPageContext,
} from "./analytics";

export type {
  ComponentShared,
  HydrationDataSpec,
  SduiTemplateStore,
  TemplateEntry,
  UiComponentTemplate,
} from "./store";

export type {
  ApiRequestConfig,
  CacheEntry,
  FeedEntry,
  LoadMoreStatus,
  PageEntry,
  SduiApiResponse,
  SduiApiResponseAs,
  SduiApiStore,
  SduiFetchReason,
  SduiInputDataMergeStrategy,
  SduiInputDataMergeStrategyResolver,
  SduiTargetedRefreshInput,
  SduiTargetedRefreshParamValue,
  SduiTargetedRefreshResult,
  SduiTargetedRefreshTargetResult,
  SduiTargetedRefreshUnavailableReason,
  UniversalPageEntry,
} from "./api";
export { CacheStatus } from "./api";

export type {
  ActionBuildContext,
  BindingContext,
  BuildPropContext,
  BuiltPropObject,
  DataBindingSource,
  DataBindingSources,
  NestedComponentBuildContext,
  Parser,
  PropBuilder,
  PropBuildOptions,
  PropBuildRequest,
  PropSignalEntry,
  ResolvedProp,
  SduiBuilder,
  SduiBuilderConfig,
  SduiBuilderDeps,
  SduiComponentConfig,
  SduiDataBinder,
} from "./binding";

export type {
  SduiImpressionContext,
  SduiImpressionEventName,
  SduiImpressionHandlerConfig,
} from "./impressions";

export type {
  SduiErrorDimensions,
  SduiErrorReporter,
  ReportSduiErrorAdditionalOptions,
} from "./error";

export { SduiLoadPhase, SduiLoadTimerMilestone } from "./performance";
export type {
  CreateSduiLoadTimerOptions,
  SduiLoadTimer,
  SduiLoadTimerStatus,
  SduiRequestStatus,
} from "./performance";

// ─── Prop Definitions (from proto) ───

export type PropKindLiteral<T> = { kind: "literal"; value: T };
export type PropKindBindingPath = { kind: "binding_path"; value: string };
export type PropKindToken = { kind: "token"; value: string };
export type PropKindFormat = {
  kind: "format";
  value: Record<string, unknown>;
};
export type PropKindConditional = {
  kind: "conditional";
  value: Record<string, unknown>;
};

export interface StringFormatDef {
  str: string;
  args: Record<
    string,
    { kind: "literal"; value: string } | { kind: "binding_path"; value: string }
  >;
}

export interface ConditionalOption {
  /** Normalized `PropCondition` oneOf from service-contracts (see `unwrapOneOf`). */
  condition: Record<string, unknown>;
  propKind: PropKind<unknown>;
}

export type PropKind<T> =
  | PropKindLiteral<T>
  | PropKindBindingPath
  | PropKindToken
  | PropKindFormat
  | PropKindConditional;

/**
 * Canonical list of prop descriptor names matching proto message short names
 * from service-contracts (prop_types.proto, ui_component_schema.proto, actions.proto).
 *
 * Intentionally maintained as a manual list rather than derived from the proto
 * schema at runtime. Bufbuild's $typeName metadata on decoded props produces
 * fully-qualified names (e.g. "roblox.apppageplatform.shared.v1beta1.StringProp"),
 * and this list narrows syntactically valid short names to descriptors with
 * known specialized registration or build-context behavior.
 */
export const PROP_DESCRIPTOR_NAMES = [
  "StringProp",
  "BoolProp",
  "Int32Prop",
  "Int64Prop",
  "FloatProp",
  "DoubleProp",
  "ColorProp",
  "ImageStringProp",
  "ImageSetProp",
  "TypographyProp",
  "TypographyFontProp",
  "ColorStyleProp",
  "FillBehaviorProp",
  "InputSizeProp",
  "UDimProp",
  "UDim2Prop",
  "Vector2Prop",
  "StructProp",
  "IconProp",
  "IconSizeProp",
  "FoundationIconConfigProp",
  "GradientProp",
  "ArrayOfStructProp",
  "UiScaledFloatProp",
  "UiScaledUDimProp",
  "UiScaledUDim2Prop",
  "ActionProp",
  "FocusNavActionsProp",
  "NestedComponentProp",
  "NestedComponentListProp",
  "LazyNestedComponentListProp",
  "StringArrayProp",
  "TemplateArg",
  // Engine enum props (prop_types_engine.proto). Routed through
  // `withParser(createEnumPrefixStripper(...))` to strip the SHOUTY_SNAKE_CASE
  // prefix into a camelCase enum value the renderer understands.
  "AutomaticSizeProp",
  "TextTruncateProp",
  "TextXAlignmentProp",
  "TextYAlignmentProp",
  "UIFlexModeProp",
  "ScaleTypeProp",
  "ResamplerModeProp",
  "SizeConstraintProp",
  "ScaleBasisProp",
  // Schema-defined structured/repeated props whose nested fields are
  // recursively dispatched. `MenuItem` is the nested message
  // `MenuItemProp.MenuItem`; `resolveDescriptorName` extracts only the
  // trailing segment, so both names must be registered. `StructProp` and
  // `ArrayOfStructProp` remain opaque protobuf Struct data.
  "MenuItemProp",
  "MenuItem",
  "FeedbackBannerActionProp",
  "FeedbackBannerAction",
  "ArrayOfFeedbackBannerActionsProp",
  "SystemBannerActionProp",
  "SystemBannerAction",
  "ArrayOfSystemBannerActionsProp",
  "GenericShareLinkData",
  "ArrayOfMenuItemProp",
  // Analytics field type carried on ComponentShared/AnalyticsData.
  "AnalyticsDataField",
] as const;

export type PropDescriptorName = (typeof PROP_DESCRIPTOR_NAMES)[number];

// ─── Template Types ───

export interface PropDefinition {
  descriptorName: PropDescriptorName;
  value: PropKind<unknown>;
}

/** Nested configs + render callback when `doesManageChildren` is true (SSR-safe closure). */
export interface SduiManagedChildList {
  configs: SduiComponentConfig[];
  renderItem: (childConfig: SduiComponentConfig, index: number, reactKey?: Key) => ReactElement;
}

/**
 * Stable key for nested configs injected when they bind to React `children` under
 * `doesManageChildren` (cannot pass `{ configs, renderItem }` as real children).
 * A single nested component uses `configs` with one element.
 *
 * Declared on {@link SduiRendererInjectedProps} as `[SDUI_MANAGED_CHILDREN_PROP]` so leaf prop types
 * stay aligned with `SduiRenderer`.
 */
export const SDUI_MANAGED_CHILDREN_PROP = "sduiManagedChildren" as const;

/**
 * Optional props the isomorphic renderer may merge into leaf components when
 * the binding pipeline supplies them. Intersect schema-specific props:
 *
 * @example
 *   export interface SduiTextProps extends SduiRendererInjectedProps { text?: string }
 */
export interface SduiRendererInjectedProps {
  /** Allows structural assignability to `ComponentType<Record<string, unknown>>` in the registry. */
  [key: string]: unknown;

  /**
   * Per-prop hydration/load status for bound props on this component.
   * Keys match template prop names (e.g. `text`, `title`).
   */
  propStatuses?: Record<string, DataStatus>;
  /** See {@link SDUI_MANAGED_CHILDREN_PROP}. */
  [SDUI_MANAGED_CHILDREN_PROP]?: SduiManagedChildList;
  /**
   * Forwarded by `SduiRenderer` whenever the binding layer attached one.
   */
  analyticsContext?: AnalyticsContext;
  /**
   * This node's `UiComponentType`, injected by `SduiRenderer` from
   * `config.componentType` (lua always passes `componentConfig` the same way).
   */
  componentType?: UiComponentType;
}

// ─── Registry Types ───

export interface SduiComponentDefinition {
  component: ComponentType<Record<string, unknown>>;
  doesManageChildren?: boolean;
  propMapping?: Record<string, string>;
  propParsers?: Record<string, (value: unknown, context: PropParserContext) => unknown>;
  propInterface?: Record<string, PropValidator>;
}

/**
 * Shared services bundle threaded into every action `handler` and `resolveHref`.
 *
 * Mirrors lua's `sduiContext.dependencies` — gives action code a single place
 * to read store state (via `dataBinder`), fire its own analytics
 * (when `skipUnifiedLogging` is set), report errors, and access the
 * page-scoped dimensions used for telemetry.
 */
export interface SduiActionContext {
  apiStore: SduiApiStore;
  /** Cache key of the page payload the action was rendered from. */
  configKey?: string;
  /** The page entry identifier of the page payload the action was rendered from. */
  pageEntryIdentifier?: string;
  dataBinder: SduiDataBinder;
  analyticsReporter: SduiAnalyticsReporter;
  errorReporter: SduiErrorReporter;
  pageContext: SduiPageContext;
  translate?: TranslateFunction;
}

/**
 * Per-action custom telemetry hook. Invoked from
 * `logActionTelemetry` either via the per-config `telemetryHandler`
 * slot or the server-named `SduiTelemetryHandlerNameRegistry` lookup.
 *
 * Runs alongside the default `reportActionAnalytics` event — it does
 * NOT replace it. Use `skipUnifiedLogging` on the handler config when
 * the custom telemetry should suppress the default itemAction event.
 */
export type SduiActionTelemetryHandler = (
  actionConfig: ActionConfig,
  analyticsContext: AnalyticsContext | undefined,
  ctx: SduiActionContext,
) => void;

export type SduiActionExecutionResult = void | Promise<void>;

export interface SduiActionHandlerConfig {
  handler?: (
    actionConfig: ActionConfig,
    analyticsContext: AnalyticsContext,
    ctx: SduiActionContext,
  ) => SduiActionExecutionResult;
  skipUnifiedLogging?: boolean;
  /**
   * Per-`ActionType` custom telemetry hook. Suppressed when the
   * server-named handler resolves successfully — the named handler
   * wins.
   */
  telemetryHandler?: SduiActionTelemetryHandler;
  /**
   * Pure function that resolves action params to a navigable URL.
   * When present, the renderer produces `<a href>` tags instead of
   * `<button onClick>`, giving crawlable links and progressive enhancement.
   */
  resolveHref?: (
    actionParams: Record<string, unknown>,
    ctx: SduiActionContext,
    analyticsContext?: AnalyticsContext,
  ) => string | undefined;
  /**
   * Set when the handler performs the navigation itself (e.g. an in-app router
   * transition). The anchor keeps its `href` for crawlers and modified clicks,
   * but the renderer suppresses the browser default on plain left clicks.
   */
  clientNavigation?: boolean;
}

export type ActionParams = Record<string, unknown>;

export interface ActionConfig {
  actionType: ActionType;
  actionParams: ActionParams;
}

export interface SduiActionData {
  actionType: ActionType;
  actionParams: Record<string, unknown>;
  analyticsContext?: AnalyticsContext;
  telemetryHandler?: string;
  actionEventName?: string;
}

export type SduiActionSnapshot =
  | { status: DataStatus.Ready; actionData: SduiActionData }
  | { status: DataStatus.NotReady | DataStatus.Failed };

/**
 * Resolved action returned by SduiActionResolver. Components decide rendering
 * based on `href`:
 * - `href` present → `<a href>` (with `onActivated` for analytics)
 * - `href` absent → `<button onClick>`
 *
 * When `clientNavigation` is true, the anchor keeps its `href` for crawlers
 * and modified clicks, but plain left clicks suppress the browser default so
 * `onActivated` can perform in-app navigation.
 */
export interface SduiResolvedAction {
  /** Fire-and-forget callback for generic UI event handlers. */
  onActivated: (overrides?: Record<string, unknown>) => void;
  /** Awaitable activation for consumers that manage pending, success, or failure state. */
  onActivatedAsync: (overrides?: Record<string, unknown>) => Promise<void>;
  href?: string;
  clientNavigation?: boolean;
}

export type SduiActionResolver = (snapshot: SduiActionSnapshot) => SduiResolvedAction;

// ─── Theme Types ───

// TODO: implement parser
/**
 * Render-ready style value for props that may arrive as either a numeric
 * literal or a token-derived class name.
 */
export type SduiTokenOrLiteral =
  | { kind: "numeric"; value: number }
  | { kind: "token"; value: string };

/** Typed runtime shape of a parsed `GradientProp`. */
export interface SduiGradient {
  startColor: string;
  endColor: string;
  startOpacity: number;
  endOpacity: number;
  degree: number;
  midpointPercent: number;
}

/** Typed runtime shape of a parsed `UDimProp` or `UiScaledUDimProp`. */
export interface SduiDim {
  scale: number;
  offset: number;
}

/** Typed runtime shape of a parsed `UDim2Prop` or `UiScaledUDim2Prop`. */
export interface SduiDim2 {
  xScale: number;
  xOffset: number;
  yScale: number;
  yOffset: number;
}

/** Typed runtime shape of a parsed `Vector2Prop`. */
export interface SduiVector2 {
  x: number;
  y: number;
}

/** Parsed value of an `AutomaticSizeProp`. */
// Const array so the runtime values are directly iterable for check in `parseAutomaticSizeProp`
export const SDUI_AUTOMATIC_SIZE_VALUES = ["none", "x", "y", "xy"] as const;
export type SduiAutomaticSize = (typeof SDUI_AUTOMATIC_SIZE_VALUES)[number];

/** Parsed value of a `ScaleTypeProp` — prefix-stripped proto enum name. */
export const SDUI_SCALE_TYPE_VALUES = ["stretch", "slice", "tile", "fit", "crop"] as const;
export type SduiScaleType = (typeof SDUI_SCALE_TYPE_VALUES)[number];

/** Parsed value of a `ScaleBasisProp` — prefix-stripped proto enum name. */
export const SDUI_SCALE_BASIS_VALUES = ["parent", "viewport"] as const;
export type SduiScaleBasis = (typeof SDUI_SCALE_BASIS_VALUES)[number];

export type SduiTextTruncate = "text-truncate-none" | "text-truncate-end" | "text-truncate-split";

export const SDUI_TEXT_TRUNCATE_TO_TAILWIND_MAP: Record<string, SduiTextTruncate> = {
  TEXT_TRUNCATE_NONE: "text-truncate-none",
  TEXT_TRUNCATE_AT_END: "text-truncate-end",
  TEXT_TRUNCATE_SPLIT_WORD: "text-truncate-split",
} as const;

/** Locale-aware translation function. */
export type TranslateFunction = (key: string, params?: Record<string, unknown>) => string;
