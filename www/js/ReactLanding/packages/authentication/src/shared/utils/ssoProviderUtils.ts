import type { SsoProvider } from "../types/ssoTypes";
import {
  isValidIdentityProviderId,
  type SsoIdentityProviderIds,
} from "../services/ssoRedirectService";

const ssoProviderOrder: readonly SsoProvider[] = ["google", "apple"];

export const getAvailableSsoProviders = (
  identityProviderIds: Readonly<SsoIdentityProviderIds>,
): SsoProvider[] =>
  ssoProviderOrder.filter(provider => isValidIdentityProviderId(identityProviderIds[provider]));
