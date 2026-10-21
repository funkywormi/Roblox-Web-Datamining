import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import AXAnalyticsConstants from "@rbx/catalog/analytics/AXAnalyticsConstants";
import { TItemCardSource } from "@rbx/catalog/analytics/axTrackingEvents";
import sendAXTracking from "@rbx/catalog/analytics/sendAXTracking";
import { AXSendTrackingActionType } from "@rbx/catalog/analytics/types";
import {
  ActionType,
  SduiErrorName,
  actionTypeName,
  findAnalyticsFieldInAncestors,
  readBigIntActionParam,
  readStringActionParam,
  type SduiActionContext,
  type SduiActionTelemetryHandler,
} from "@rbx/sdui-core";

const ACTION_TYPE_NAME = actionTypeName(ActionType.OPEN_MARKETPLACE_TRY_ON);
const APP_PAGE = { SearchPage: "searchPage" } as const;

const ITEM_TYPE_CONFIG = {
  Asset: {
    path: "catalog",
    requiresSubType: true,
  },
  Bundle: {
    path: "bundles",
    requiresSubType: true,
  },
  Look: {
    path: "looks",
    requiresSubType: false,
  },
} as const;

type MarketplaceItemType = keyof typeof ITEM_TYPE_CONFIG;

function reportMalformedParam(ctx: SduiActionContext, message: string, propName: string): void {
  ctx.errorReporter.reportSduiError(SduiErrorName.MalformedActionParam, message, ctx.pageContext, {
    actionType: ACTION_TYPE_NAME,
    propName,
  });
}

/** Maps an SDUI app page to the marketplace AX item-click source. */
function getMarketplaceAXSourceForAppPage(appPage: string): TItemCardSource | undefined {
  switch (appPage) {
    case APP_PAGE.SearchPage:
      // Named after MarketplaceUnifiedSurface.DISCOVERY_SEARCH_RESULTS;
      // this is an AX metadata label, not the numeric unified-event enum.
      // https://github.rbx.com/Roblox/proto-schemas/blob/master/production/eventstream/userjourney/enums/marketplace_unified_surface.proto
      return TItemCardSource.DiscoverySearchResults;
    default:
      return undefined;
  }
}

function isMarketplaceItemType(value: string): value is MarketplaceItemType {
  return Object.hasOwn(ITEM_TYPE_CONFIG, value);
}

function readItemType(value: string | undefined): MarketplaceItemType | undefined {
  if (value !== undefined && isMarketplaceItemType(value)) {
    return value;
  }
  return undefined;
}

function getValidatedMarketplaceParams(
  actionParams: Record<string, unknown>,
  ctx: SduiActionContext,
): { itemId: string; itemType: MarketplaceItemType; itemPrice?: number | string } | undefined {
  const itemId = readStringActionParam(actionParams, "itemId", undefined);
  if (itemId === undefined) {
    reportMalformedParam(ctx, `Missing or invalid itemId for ${ACTION_TYPE_NAME}`, "itemId");
    return undefined;
  }

  const itemType = readItemType(readStringActionParam(actionParams, "itemType", undefined));
  if (itemType === undefined) {
    reportMalformedParam(ctx, `Missing or invalid itemType for ${ACTION_TYPE_NAME}`, "itemType");
    return undefined;
  }

  const itemSubTypeName = readStringActionParam(actionParams, "itemSubTypeName", undefined);
  if (ITEM_TYPE_CONFIG[itemType].requiresSubType && itemSubTypeName === undefined) {
    reportMalformedParam(
      ctx,
      `Missing or invalid itemSubTypeName for ${ACTION_TYPE_NAME}`,
      "itemSubTypeName",
    );
    return undefined;
  }

  const itemPrice = readBigIntActionParam(actionParams, "itemPrice", undefined);

  return { itemId, itemType, itemPrice };
}

export function openMarketplaceTryOnResolveHref(
  actionParams: Record<string, unknown>,
  ctx: SduiActionContext,
): string | undefined {
  const params = getValidatedMarketplaceParams(actionParams, ctx);
  if (params === undefined) {
    return undefined;
  }

  const marketplacePath = ITEM_TYPE_CONFIG[params.itemType].path;
  return getAbsoluteUrl(`/${marketplacePath}/${params.itemId}`);
}

export const openMarketplaceTryOnTelemetryHandler: SduiActionTelemetryHandler = (
  actionConfig,
  analyticsContext,
  ctx,
): void => {
  const params = getValidatedMarketplaceParams(actionConfig.actionParams, ctx);
  if (params === undefined) {
    return;
  }

  const { appPage } = ctx.pageContext;
  const source = getMarketplaceAXSourceForAppPage(appPage);
  if (!source) {
    reportMalformedParam(ctx, `Unsupported appPage for ${ACTION_TYPE_NAME}: ${appPage}`, "appPage");
    return;
  }

  const fields = {
    source,
    actionType: ACTION_TYPE_NAME,
    pageContext: appPage,
    itemId: params.itemId,
    itemType: params.itemType,
    itemPrice: params.itemPrice,
    widgetId: findAnalyticsFieldInAncestors("widgetId", analyticsContext),
    widgetType: findAnalyticsFieldInAncestors("widgetType", analyticsContext),
    widgetItemIds: findAnalyticsFieldInAncestors("widgetItemIds", analyticsContext),
    requestId: findAnalyticsFieldInAncestors("requestId", analyticsContext),
  };

  try {
    sendAXTracking({
      itemName: AXAnalyticsConstants.ItemCardClick,
      actionType: AXSendTrackingActionType.Click,
      metaData: { metaData: JSON.stringify(fields) },
    });
  } catch (error) {
    ctx.errorReporter.reportSduiError(
      SduiErrorName.FailedToExecuteAction,
      `AX tracking failed for ${ACTION_TYPE_NAME}: ${error instanceof Error ? error.message : String(error)}`,
      ctx.pageContext,
      { actionType: ACTION_TYPE_NAME },
    );
  }
};
