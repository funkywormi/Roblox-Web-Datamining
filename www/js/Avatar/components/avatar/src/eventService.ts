import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import {
  outfitClickEventName,
  outfitEventType,
  outfitWearEventName,
} from "./constants/avatarOutfitEventConstants";
import {
  advancedEditSaveEventName,
  advancedEditEventType,
} from "./constants/avatarAdvancedEventConstants";
import {
  avatarCategoryTap,
  avatarSortContext,
  tabName,
  avatarRefineChangeOrderTap,
  avatarRefineItemRemoved,
  avatarRefineAutosaved,
} from "./constants/avatarSortEventConstants";

// Migrated off the legacy `@rbx/legacy-webapp-types/Roblox` `EventStream` barrel to the modern
// `@rbx/core-scripts/event-stream` (dual-target: real module on .NET, SSR-safe shim on Next.js).
// `sendEventWithTarget` internally no-ops when the eventstream is unavailable, so the previous
// `if (EventStream)` guards are no longer needed.

export function sendOutfitClickEvent(userOutfitId: number, outfitType: string) {
  sendEventWithTarget(
    outfitClickEventName,
    outfitEventType,
    {
      userOutfitId,
      outfitType,
    },
    targetTypes.WWW,
  );
}

export function sendOutfitWearEvent(userOutfitId: number, success: boolean) {
  sendEventWithTarget(
    outfitWearEventName,
    outfitEventType,
    {
      userOutfitId,
      success,
    },
    targetTypes.WWW,
  );
}

export function sendAdvancedEditSaveEvent(
  assetIds: string[],
  page: string | undefined,
  didSaveSucceed: boolean,
): void {
  sendEventWithTarget(
    advancedEditSaveEventName,
    advancedEditEventType,
    {
      // `sendEventWithTarget` takes scalar props (the legacy barrel typed this `unknown` and passed
      // the array through); serialize to preserve the list in the event payload.
      assetIds: JSON.stringify(assetIds),
      accessoryPage: page,
      success: didSaveSucceed,
    },
    targetTypes.WWW,
  );
}

export function avatarCategoryTapEvent() {
  sendEventWithTarget(
    avatarCategoryTap,
    avatarSortContext,
    {
      tab_name: tabName,
    },
    targetTypes.WWW,
  );
}

export function avatarRefineChangeOrderTapEvent() {
  sendEventWithTarget(avatarRefineChangeOrderTap, avatarSortContext, {}, targetTypes.WWW);
}

export function avatarRefineItemRemovedEvent() {
  sendEventWithTarget(avatarRefineItemRemoved, avatarSortContext, {}, targetTypes.WWW);
}

export function avatarRefineAutosavedEvent() {
  sendEventWithTarget(avatarRefineAutosaved, avatarSortContext, {}, targetTypes.WWW);
}
