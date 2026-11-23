import * as eventStreamService from "@rbx/core-scripts/event-stream";

const EVENT_NAME = "userItemsPage";
const CONTEXT = "userItemsPage";

type UserItemsPageParams = {
  pageType: "inventory" | "favorites";
  // "show" or "click".
  eventType: "show" | "click";
  // What was shown or clicked: "page", "item", "private_server", "status_filter_tab", etc.
  component: string;
  categoryName: string;
  subcategoryName: string;
  isOwnPage: boolean;
  // e.g. Item id, private server id, or tab id
  componentId?: string;
  categoryExtra?: string;
  // Zero-based position of the item in the visible list. Unset for non-item actions.
  index?: number;
  // itemV2.type, e.g. "asset", "bundle", "game". Unset for non-item components.
  itemType?: string;
  // JSON object of event-specific extras.
  logExtras?: string;
};

export const sendUserItemsPage = ({
  pageType,
  eventType,
  component,
  categoryName,
  subcategoryName,
  isOwnPage,
  componentId,
  categoryExtra,
  index,
  itemType,
  logExtras,
}: UserItemsPageParams): void => {
  if (!categoryName || !subcategoryName) {
    return;
  }

  const params: Record<string, string | number | boolean> = {
    pageType,
    eventType,
    component,
    categoryName,
    subcategoryName,
    isOwnPage,
  };
  if (componentId !== undefined) {
    params.componentId = componentId;
  }
  if (categoryExtra !== undefined) {
    params.categoryExtra = categoryExtra;
  }
  if (index !== undefined) {
    params.index = index;
  }
  if (itemType !== undefined) {
    params.itemType = itemType;
  }
  if (logExtras !== undefined) {
    params.logExtras = logExtras;
  }

  try {
    eventStreamService.sendEventWithTarget(EVENT_NAME, CONTEXT, params);
  } catch {
    // Telemetry must never break the inventory/favorites page flow.
  }
};
