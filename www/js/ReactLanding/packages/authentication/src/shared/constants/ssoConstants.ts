import { EnvironmentUrls } from "@rbx/environment-urls";
import type { SsoIdentityProviderIds } from "../services/ssoRedirectService";

// Provider IDs are public record identifiers, not OAuth credentials. Missing entries intentionally
// hide that provider in environments where it is not configured.
const ssoIdentityProviderIdsByDomain: Readonly<Record<string, Readonly<SsoIdentityProviderIds>>> = {
  "roblox.com": {
    google: 3161830277039358,
    apple: 394101157566898,
  },
  "sitetest1.robloxlabs.com": {
    google: 1581220258196741,
    apple: 129176487952242,
  },
  "sitetest2.robloxlabs.com": {},
  "sitetest3.robloxlabs.com": {
    google: 2231781751833936,
  },
};

export const getSsoIdentityProviderIds = (
  domain: string | undefined,
): Readonly<SsoIdentityProviderIds> =>
  domain == null ? {} : (ssoIdentityProviderIdsByDomain[domain.toLowerCase()] ?? {});

export const ssoIdentityProviderIds = getSsoIdentityProviderIds(EnvironmentUrls.domain);

// These keys live in the Authentication.Login namespace.
export const ssoProviderLabels = {
  google: "Action.Google",
  apple: "Action.Apple",
} as const;

export const ssoDividerLabel = "Label.OR";
