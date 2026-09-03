import { getDeviceMeta } from "@rbx/core-scripts/meta/device";

// Per-tab by design: flag is set + consumed in the same tab. Cross-tab leak
// of the flag would risk double-firing Succeeded on unrelated tabs.
const STORAGE_KEY = "roblox_ps_upsell_checkout_pending";
const TTL_MS = 30 * 60 * 1000;

export type Platform = "desktop" | "mobileInApp" | "mobileWeb";

export function getPsUpsellPlatform(): Platform {
  const meta = getDeviceMeta();
  if (meta?.isAndroidApp || meta?.isIosApp) return "mobileInApp";
  if (meta?.isPhone || meta?.isTablet) return "mobileWeb";
  return "desktop";
}

export function savePsUpsellCheckoutPending(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now() }));
  } catch {
    // sessionStorage may be unavailable (incognito, disabled)
  }
}

export function consumePsUpsellCheckoutPending(): boolean {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    sessionStorage.removeItem(STORAGE_KEY);

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || !("ts" in parsed)) return false;
    const { ts } = parsed;
    if (typeof ts !== "number") return false;
    return Date.now() - ts <= TTL_MS;
  } catch {
    return false;
  }
}
