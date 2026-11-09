import { AXSendTrackingActionType } from "@rbx/catalog/analytics/types";
import sendAXTracking from "@rbx/catalog/analytics/sendAXTracking";
import AXAnalyticsConstants from "@rbx/catalog/analytics/AXAnalyticsConstants";

// Short names for the avatar editor events in `@rbx/catalog`'s AXAnalyticsConstants.
export const AvatarEditorTrackingEvents = {
  FirstEdit: AXAnalyticsConstants.AvatarEditorFirstEditClick,
  Edit: AXAnalyticsConstants.AvatarEditorEditClick,
  Equip: AXAnalyticsConstants.AvatarEditorEquipClick,
  Unequip: AXAnalyticsConstants.AvatarEditorUnequipClick,
  BodyColorChange: AXAnalyticsConstants.AvatarEditorBodyColorChangeClick,
  ScaleChange: AXAnalyticsConstants.AvatarEditorScaleChangeClick,
  TypeChange: AXAnalyticsConstants.AvatarEditorTypeChangeClick,
  AdvancedEditor: AXAnalyticsConstants.AvatarEditorAdvancedEditorClick,
  EmoteChange: AXAnalyticsConstants.AvatarEditorEmoteChangeClick,
  RecommendationClick: AXAnalyticsConstants.AvatarEditorRecommendationClick,
  GetMoreClick: AXAnalyticsConstants.AvatarEditorGetMoreClick,
  OutfitCreated: AXAnalyticsConstants.AvatarEditorOutfitCreatedClick,
  OutfitDeleted: AXAnalyticsConstants.AvatarEditorOutfitDeletedClick,
  OutfitEdited: AXAnalyticsConstants.AvatarEditorOutfitEditedClick,
} as const;

export type AXTrackingMetaData = Record<string, string | number | boolean | undefined | null>;

const FIRST_EDIT_SESSION_KEY = "AvatarEditorFirstEditTracked";

// Drop undefined/null values so we only serialize meaningful metadata.
const cleanMetaData = (
  metaData?: AXTrackingMetaData,
): Record<string, string | number | boolean> => {
  const cleaned: Record<string, string | number | boolean> = {};
  if (!metaData) {
    return cleaned;
  }
  Object.entries(metaData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

/**
 * Sends a single Avatar Experience click tracking event with optional rich
 * metadata (e.g. selected category, item position). Rich metadata is serialized
 * into the AX telemetry `metaData` column.
 */
export const trackAvatarEditorClick = (itemName: string, metaData?: AXTrackingMetaData): void => {
  const cleaned = cleanMetaData(metaData);
  sendAXTracking({
    itemName,
    actionType: AXSendTrackingActionType.Click,
    ...(Object.keys(cleaned).length > 0 ? { metaData: { metaData: JSON.stringify(cleaned) } } : {}),
  });
};

const hasTrackedFirstEdit = (): boolean => {
  try {
    return sessionStorage.getItem(FIRST_EDIT_SESSION_KEY) === "true";
  } catch {
    // sessionStorage unavailable: avoid repeatedly emitting first-edit.
    return true;
  }
};

const markFirstEditTracked = (): void => {
  try {
    sessionStorage.setItem(FIRST_EDIT_SESSION_KEY, "true");
  } catch {
    // sessionStorage unavailable: nothing to persist.
  }
};

/**
 * Tracks an avatar edit. For every edit this fires:
 *  - the specific edit event (e.g. AvatarEditorEquipClick)
 *  - the generic AvatarEditorEditClick event
 *  - AvatarEditorFirstEditClick, only once per session (the first edit a user makes)
 */
export const trackAvatarEdit = (editEventName: string, metaData?: AXTrackingMetaData): void => {
  trackAvatarEditorClick(editEventName, metaData);
  trackAvatarEditorClick(AvatarEditorTrackingEvents.Edit, {
    editType: editEventName,
    ...metaData,
  });
  if (!hasTrackedFirstEdit()) {
    markFirstEditTracked();
    trackAvatarEditorClick(AvatarEditorTrackingEvents.FirstEdit, {
      editType: editEventName,
      ...metaData,
    });
  }
};
