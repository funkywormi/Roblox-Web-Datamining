import { enumToJson } from "@bufbuild/protobuf";
import {
  EventNames,
  ItemActionMetadata,
  parseEventParams,
  SharedEventMetadata,
} from "@rbx/unified-logging";
import { SduiErrorName } from "../errors/SduiErrors";
import type {
  ActionConfig,
  AnalyticsContext,
  AnalyticsFieldMap,
  SduiAnalyticsReporter,
  SduiErrorReporter,
  SduiPageContext,
} from "../types";
import { UiComponentTypeSchema } from "../types";
import { actionTypeName, jsonEnumToString } from "../utils/protoEnum";

type EventParamValue =
  | number
  | string
  | boolean
  | object
  | (number | string | boolean)[]
  | undefined;

type PrimitiveParam = string | number | boolean;

function normalizeActionParamsForTelemetry(
  actionParams: Record<string, unknown> | undefined,
  pageContext: SduiPageContext | undefined,
  errorReporter: SduiErrorReporter | undefined,
): Record<string, PrimitiveParam> {
  if (!actionParams) return {};
  const normalized: Record<string, PrimitiveParam> = {};
  for (const [key, value] of Object.entries(actionParams)) {
    // Strip bufbuild internal message metadata (`$typeName`, `$unknown`) so it
    // does not leak into telemetry payloads (Lua `SendItemActionEvent` parity).
    if (key.startsWith("$")) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      normalized[key] = value;
    } else if (value !== undefined && value !== null) {
      try {
        // bigint (e.g. proto int64 fields) can't be JSON-serialized, so stringify
        // it directly; objects/arrays serialize to JSON.
        normalized[key] = typeof value === "bigint" ? value.toString() : JSON.stringify(value);
      } catch {
        // Serialization can still fail (e.g. circular references); drop the param
        // and report rather than letting it throw out of the telemetry path.
        errorReporter?.reportSduiError(
          SduiErrorName.MalformedActionParam,
          `Failed to serialize actionParam key="${key}" type=${typeof value}`,
          pageContext,
        );
      }
    }
  }
  return normalized;
}

function withoutPoolControlFields(
  fields: AnalyticsFieldMap | undefined,
): AnalyticsFieldMap | undefined {
  if (!fields) return undefined;
  const { doesNotAdvanceStartRow: _poolControlFlag, ...rest } = fields;
  return rest;
}

function getEventContext(pageContext?: SduiPageContext): string {
  return pageContext?.appPage ?? "unknown";
}

function componentTypeToString(componentType: number | string): string {
  if (typeof componentType === "string") return componentType;
  try {
    return jsonEnumToString(enumToJson(UiComponentTypeSchema, componentType));
  } catch {
    return String(componentType);
  }
}

export function createInteractionUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, char => {
    const nibble = Math.floor(Math.random() * 16);
    const value = char === "x" ? nibble : (nibble & 0x3) | 0x8;
    return value.toString(16);
  });
}

export interface ReportActionAnalyticsOptions {
  /**
   * Fires the itemAction-shaped payload under a non-default event name.
   * Used by `logActionTelemetry` on the no-telemetry-handler branch when
   * `actionEventName` is set.
   */
  eventNameOverride?: string;
  /** Shared correlation id when dual-writing `actionEventName` + `itemAction`. */
  interactionUuid?: string;
}

/**
 * Shape and dispatch an itemAction analytics event.
 *
 * Collection data is optional — detail pages (e.g. Badge Details) don't
 * have collection context, and actions should still fire with whatever
 * analytics data is available.
 *
 * Action-specific dimensions on `actionConfig.actionParams` (e.g. `placeId`,
 * `universeId`) are merged into the event under their own keys so downstream
 * consumers can read them off the default itemAction event. Canonical
 * metadata keys (collection / item / ActionType) always win on collision.
 */
export function reportActionAnalytics(
  actionConfig: ActionConfig,
  analyticsContext: AnalyticsContext,
  pageContext?: SduiPageContext,
  analyticsReporter?: SduiAnalyticsReporter,
  errorReporter?: SduiErrorReporter,
  options?: ReportActionAnalyticsOptions,
): void {
  if (!analyticsReporter) return;

  const collectionData = analyticsContext.getCollectionData?.();
  const ownData = withoutPoolControlFields(analyticsContext.analyticsData);
  const ancestorData = withoutPoolControlFields(analyticsContext.ancestorAnalyticsData);
  // itemPosition/itemComponentType come from setLocalAnalyticsData injected by
  // SduiRenderer on the list item; nested descendants (e.g. buttons) inherit
  // them via ancestorData alongside id.
  const idSource = ownData?.id != null ? ownData : ancestorData;
  const itemPositionSource = ownData?.itemPosition != null ? ownData : ancestorData;
  const itemComponentTypeSource = ownData?.itemComponentType != null ? ownData : ancestorData;
  const context = getEventContext(pageContext);
  const normalizedActionParams = normalizeActionParamsForTelemetry(
    actionConfig.actionParams,
    pageContext,
    errorReporter,
  );

  // Precedence matches Lua SendItemActionEvent; canonical fields below win.
  const params: Record<string, EventParamValue> = {
    ...collectionData,
    ...ancestorData,
    ...ownData,
    ...normalizedActionParams,
    [SharedEventMetadata.Context]: context,
    [ItemActionMetadata.ActionType]: actionTypeName(actionConfig.actionType),
  };

  if (collectionData) {
    params[SharedEventMetadata.CollectionId] = collectionData.collectionId;
    params[SharedEventMetadata.CollectionPosition] = collectionData.collectionPosition;
    params[SharedEventMetadata.ContentType] = collectionData.contentType;
    params[SharedEventMetadata.CollectionComponentType] = collectionData.collectionComponentType;
    params[ItemActionMetadata.TotalNumberOfItems] = collectionData.totalNumberOfItems;
  }

  if (ownData || ancestorData) {
    const itemPosition = Number(itemPositionSource?.itemPosition ?? -1);
    // Rows follow the section-local cell (Lua `SduiCollectionGrid` itemPosition), not the pool rank.
    const layoutPosition = analyticsContext.getLayoutCellPosition?.() ?? itemPosition;
    params[ItemActionMetadata.ItemId] = String(idSource?.id ?? "unknown");
    params[ItemActionMetadata.ItemPosition] = itemPosition;
    params[ItemActionMetadata.PositionInTopic] = itemPosition;
    params[ItemActionMetadata.ItemComponentType] = componentTypeToString(
      typeof itemComponentTypeSource?.itemComponentType === "boolean"
        ? String(itemComponentTypeSource.itemComponentType)
        : (itemComponentTypeSource?.itemComponentType ?? "unknown"),
    );

    if (collectionData) {
      // Matches Lua `calculateRowPositionFields` (1-based row/column coordinates; -1 when unavailable).
      const { itemsPerRow } = collectionData;
      const startRowNumber =
        typeof collectionData.startRowNumber === "number"
          ? collectionData.startRowNumber
          : undefined;
      if (layoutPosition > 0 && itemsPerRow > 0) {
        const rowNumber = Math.ceil(layoutPosition / itemsPerRow);
        params[ItemActionMetadata.RowNumber] = rowNumber;
        params[ItemActionMetadata.PositionInRow] = ((layoutPosition - 1) % itemsPerRow) + 1;
        params[ItemActionMetadata.FeedRowNumber] =
          startRowNumber !== undefined ? startRowNumber + rowNumber - 1 : -1;
      } else {
        params[ItemActionMetadata.RowNumber] = -1;
        params[ItemActionMetadata.PositionInRow] = -1;
        params[ItemActionMetadata.FeedRowNumber] = -1;
      }
    }
  }

  // Prefer actionParams / caller-shared uuid, else generate (lua itemActionEvent parity).
  // Do not inherit a stale interactionUuid from collection/ancestor analytics snapshots.
  params.interactionUuid =
    normalizedActionParams.interactionUuid ?? options?.interactionUuid ?? createInteractionUuid();

  const eventName = options?.eventNameOverride ?? EventNames.ItemAction;
  const parsedParams = parseEventParams(params);
  const descriptor = {
    name: eventName,
    type: eventName,
    context,
  };

  analyticsReporter.logEvent(descriptor, parsedParams);
}
