import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
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
const UNIFIED_EVENT_LOG_NAME = "unifiedEventLog";
const MARKETPLACE_ORGANIC_EVENT_NAME = "marketplaceOrganicFELog";
// These are the bare minimum values needed for the marketplace action
// https://github.rbx.com/Roblox/proto-schemas/blob/master/production/eventstream/userjourney/enums/marketplace_unified_action.proto
const MARKETPLACE_UNIFIED_ACTION = { ItemSelected: 3 } as const;
// https://github.rbx.com/Roblox/proto-schemas/blob/master/production/eventstream/avatarmarketplacesnd/enums/marketplace_action_type.proto
const MARKETPLACE_ACTION_TYPE = { UiButtonClick: 9 } as const;
// https://github.rbx.com/Roblox/proto-schemas/blob/master/production/eventstream/userjourney/enums/marketplace_eventsender_api.proto
const MARKETPLACE_EVENT_SENDER_API = { SendRobloxTelemetryEvent: 2 } as const;
// https://github.rbx.com/Roblox/proto-schemas/blob/master/production/eventstream/userjourney/enums/marketplace_client.proto
const MARKETPLACE_CLIENT = { Web: 1, WebMobile: 2 } as const;
// https://github.rbx.com/Roblox/proto-schemas/blob/master/production/eventstream/userjourney/enums/marketplace_unified_item_type.proto
const MARKETPLACE_UNIFIED_ITEM_TYPE = { Asset: 1, Bundle: 2, Look: 3 } as const;
// https://github.rbx.com/Roblox/proto-schemas/blob/master/production/eventstream/userjourney/enums/marketplace_unified_surface.proto
const MARKETPLACE_UNIFIED_SURFACE = { DiscoverySearchResults: 11 } as const;
// https://github.rbx.com/Roblox/proto-schemas/blob/master/production/eventstream/avatarmarketplacesnd/enums/marketplace_surface_type.proto
const MARKETPLACE_SURFACE_TYPE = { DiscoverySearchResults: 7 } as const;
// https://github.rbx.com/Roblox/proto-schemas/blob/master/production/eventstream/avatarmarketplacesnd/enums/widget_ui_treatement.proto
const WIDGET_UI_TREATMENT = { ItemGroup: 1 } as const;

const APP_PAGE = { SearchPage: "searchPage" } as const;

const MARKETPLACE_EVENT_CONFIG_BY_APP_PAGE: Record<
  string,
  { unifiedSurface: number; organicContext: string; organicGroup: string; organicSurface: number }
> = {
  [APP_PAGE.SearchPage]: {
    unifiedSurface: MARKETPLACE_UNIFIED_SURFACE.DiscoverySearchResults,
    organicContext: "TryOnScreen",
    organicGroup: "AvatarItemWidgetClick",
    organicSurface: MARKETPLACE_SURFACE_TYPE.DiscoverySearchResults,
  },
};

const ITEM_TYPE_CONFIG = {
  Asset: {
    path: "catalog",
    telemetryType: MARKETPLACE_UNIFIED_ITEM_TYPE.Asset,
    requiresSubType: true,
  },
  Bundle: {
    path: "bundles",
    telemetryType: MARKETPLACE_UNIFIED_ITEM_TYPE.Bundle,
    requiresSubType: true,
  },
  Look: {
    path: "looks",
    telemetryType: MARKETPLACE_UNIFIED_ITEM_TYPE.Look,
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

function getMarketplaceEventConfig(
  ctx: SduiActionContext,
): (typeof MARKETPLACE_EVENT_CONFIG_BY_APP_PAGE)[string] | undefined {
  const { appPage } = ctx.pageContext;
  const config = MARKETPLACE_EVENT_CONFIG_BY_APP_PAGE[appPage];
  if (config === undefined) {
    reportMalformedParam(ctx, `Unsupported appPage for ${ACTION_TYPE_NAME}: ${appPage}`, "appPage");
  }
  return config;
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

function getMarketplaceClient(): number {
  const deviceMeta = getDeviceMeta();
  return deviceMeta?.isPhone === true || deviceMeta?.isTablet === true
    ? MARKETPLACE_CLIENT.WebMobile
    : MARKETPLACE_CLIENT.Web;
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

  const eventConfig = getMarketplaceEventConfig(ctx);
  if (eventConfig === undefined) {
    return;
  }

  ctx.analyticsReporter.logEvent(
    {
      name: MARKETPLACE_ORGANIC_EVENT_NAME,
      type: MARKETPLACE_ORGANIC_EVENT_NAME,
      context: eventConfig.organicContext,
    },
    {
      actionType: MARKETPLACE_ACTION_TYPE.UiButtonClick,
      group: eventConfig.organicGroup,
      surface: eventConfig.organicSurface,
      item_id: params.itemId,
      item_type: params.itemType,
      event_sender_api: MARKETPLACE_EVENT_SENDER_API.SendRobloxTelemetryEvent,
      client: getMarketplaceClient(),
    },
  );

  const fields: Record<string, string | number> = {
    itemId: params.itemId,
    itemType: ITEM_TYPE_CONFIG[params.itemType].telemetryType,
    action: MARKETPLACE_UNIFIED_ACTION.ItemSelected,
    surface: eventConfig.unifiedSurface,
  };
  const widgetId = findAnalyticsFieldInAncestors("widgetId", analyticsContext, "");
  const widgetType = findAnalyticsFieldInAncestors("widgetType", analyticsContext, "");
  const widgetItemIds = findAnalyticsFieldInAncestors("widgetItemIds", analyticsContext, "");
  const requestId = findAnalyticsFieldInAncestors("requestId", analyticsContext, "");
  const hasWidgetAttribution =
    widgetId !== "" && widgetType !== "" && widgetItemIds !== "" && requestId !== "";

  if (hasWidgetAttribution) {
    Object.assign(fields, {
      widgetId,
      widgetType,
      widgetItemIds,
      requestId,
      uiTreatmentType: WIDGET_UI_TREATMENT.ItemGroup,
    });
  }

  if (params.itemPrice !== undefined) {
    const priceField = hasWidgetAttribution ? "widgetItemPrice" : "organicItemPrice";
    fields[priceField] = params.itemPrice;
  }

  ctx.analyticsReporter.logEvent(
    {
      name: UNIFIED_EVENT_LOG_NAME,
      type: UNIFIED_EVENT_LOG_NAME,
      context: UNIFIED_EVENT_LOG_NAME,
    },
    fields,
  );
};
