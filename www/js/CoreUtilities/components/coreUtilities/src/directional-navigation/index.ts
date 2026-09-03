import { addLegacyExternal } from "@rbx/externals";
import { setupOverlay } from "./overlay";
import { setupGamepadNavigation } from "./setupGamepadNavigation";
import { setupKeyboardNavigation } from "./setupKeyboardNavigation";

function isEligible(): boolean {
  const userAgent = window.navigator.userAgent.toUpperCase();
  return (
    // This is a hack to prevent public users from being eligible, while allowing:
    // - internal users building PCGDK to test
    // - internal users testing on Chrome by overriding the user agent
    // TODO: Remove this.
    userAgent.includes("ROBLOX/WINPCGDK ROBLOX PCGDK") ||
    // This is the agreed upon way for the UApp to enable gamepad navigation.
    userAgent.includes("GAMEPADNAVIGATION")
  );
}

export function initializeGamepadNavigation(): void {
  if (!isEligible()) {
    return;
  }

  setupOverlay();
  setupGamepadNavigation();
}

function initializeKeyboardNavigation(): void {
  setupOverlay();
  setupKeyboardNavigation();
}

addLegacyExternal(["Roblox", "DirectionalNavigation"], {
  initializeKeyboardNavigation,
});
