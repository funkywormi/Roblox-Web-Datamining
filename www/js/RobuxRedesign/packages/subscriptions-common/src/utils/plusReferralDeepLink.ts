const DEEP_LINK_BASE = "roblox://navigation/plus_subscribe";

export type PlusSubscribeDeepLinkParams = {
  surface: string;
  entrypoint: string;
  referrerId?: number;
};

export function buildPlusSubscribeDeepLink({
  surface,
  entrypoint,
  referrerId,
}: PlusSubscribeDeepLinkParams): string {
  const url = new URL(DEEP_LINK_BASE);
  const params: Record<string, string> = { surface, entrypoint };
  if (referrerId !== undefined) {
    params.referrer_id = String(referrerId);
  }
  url.search = new URLSearchParams(params).toString();
  return url.toString();
}
