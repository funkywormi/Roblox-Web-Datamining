import { window } from "@rbx/core-lib/browser";

const REDIRECT_URL_KEY = "roblox_subscription_redirect_url";
const TTL_MS = 30 * 60 * 1000; // 30 minutes

export function saveSubscriptionRedirectUrl(url: string): void {
  try {
    const payload = JSON.stringify({ url, ts: Date.now() });
    window?.sessionStorage.setItem(REDIRECT_URL_KEY, payload);
  } catch {
    // sessionStorage may be unavailable (e.g. incognito, disabled)
  }
}

export function consumeSubscriptionRedirectUrl(): string | null {
  try {
    const raw = window?.sessionStorage.getItem(REDIRECT_URL_KEY);
    if (!raw) return null;

    window?.sessionStorage.removeItem(REDIRECT_URL_KEY);

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    if (!("url" in parsed) || !("ts" in parsed)) return null;
    const { url, ts } = parsed;
    if (typeof url !== "string" || typeof ts !== "number") return null;
    if (Date.now() - ts > TTL_MS) return null;

    return url;
  } catch {
    return null;
  }
}
