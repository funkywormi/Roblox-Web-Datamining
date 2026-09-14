import type { GetPrivateServersSystemSettingsResponse } from "@rbx/client-private-servers-api-v2/v2";
import type {
  BenefitCapOutcome,
  MyPrivateServerRaw,
  MyPrivateServerResponse,
  PrivateServerWithBenefitCap,
} from "../types/privateServerTypes";

const PRIVATE_SERVER_RENEWAL_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

export const parsePrivateServerWithDate = (
  server: MyPrivateServerRaw,
): MyPrivateServerResponse => ({
  ...server,
  expirationDate: new Date(server.expirationDate),
});

// If the call to fetch settings fails after retries, fallback to the old behavior of not displaying Plus free servers.
export const FALLBACK_SYSTEM_SETTINGS: GetPrivateServersSystemSettingsResponse = {
  enforcementStartDate: new Date(0),
  plusFreePrivateServerCap: 0,
  displayPlusFreePrivateServers: false,
};

const hasRobloxSubscriptionTag = (server: MyPrivateServerResponse): boolean =>
  server.metadata?.privateServerSubscriptionTags?.includes("RobloxSubscription") ?? false;

const isPaid = (server: MyPrivateServerResponse): boolean => (server.priceInRobux ?? 0) > 0;

const isNotExpired = (server: MyPrivateServerResponse): boolean =>
  server.expirationDate.getTime() > Date.now();

// A "Plus free" private server is one granted free by the Roblox Plus benefit: zero price but a
// nonzero discount.
// TODO: replace this numeric check with the "RobloxSubscriptionActiveBenefit" subscription tag
// once that tag is fully backfilled on existing servers.
const isPlusFreeServer = (server: MyPrivateServerResponse): boolean =>
  (server.priceInRobux ?? 0) === 0 && (server.totalDiscountAmountInRobux ?? 0) > 0;

// Current behavior: not expired AND (paid OR purchased before user got Plus, so includes a few free servers)
export const shouldRenderPrivateServer = (server: MyPrivateServerResponse): boolean => {
  const hasValidDiscount =
    (server.totalDiscountAmountInRobux ?? 0) > 0 && !hasRobloxSubscriptionTag(server);
  return isNotExpired(server) && (isPaid(server) || hasValidDiscount);
};

// Behavior when Plus free servers are displayed: not expired AND (paid OR Plus free).
export const shouldRenderWithPlusFree = (server: MyPrivateServerResponse): boolean =>
  isNotExpired(server) && (isPaid(server) || isPlusFreeServer(server));

// The first 30-day renewal on or after enforcement. Servers renew every 30 days, so if the current
// expiration precedes enforcement we roll it forward in 30-day steps to the first renewal that
// lands on or after the enforcement date.
const firstRenewalOnOrAfter = (
  server: MyPrivateServerResponse,
  enforcementStartDate: Date,
): Date => {
  const expiration = server.expirationDate.getTime();
  const enforcement = enforcementStartDate.getTime();
  if (expiration >= enforcement) {
    return new Date(expiration);
  }
  const periods = Math.ceil((enforcement - expiration) / PRIVATE_SERVER_RENEWAL_PERIOD_MS);
  return new Date(expiration + periods * PRIVATE_SERVER_RENEWAL_PERIOD_MS);
};

// If a Plus free private server is canceled before the enforcement of the Plus cap begins, it will not count against the cap.
const survivesUntilPlusCapEnforcement = (
  server: MyPrivateServerResponse,
  enforcementStartDate: Date,
): boolean => server.willRenew || server.expirationDate >= enforcementStartDate;

// Computes the cycle dates CycleEndDate displays for a server, accounting for the Plus free benefit cap.
// - expiryDateWithCap: when the server actually ends. A server that auto-expires from the cap ends at its first
//   renewal on or after enforcement; if it was already expiring, whichever comes first.
// - renewalDateWithCap: the next renewal, or new Date(0) when the server won't renew
export const getCycleDatesWithCap = (params: {
  expirationDate: Date;
  willRenew: boolean;
  benefitCapOutcome: BenefitCapOutcome;
  firstRenewalOnOrAfterEnforcement?: Date;
}): { expiryDateWithCap: Date; renewalDateWithCap: Date } => {
  const { expirationDate, willRenew, benefitCapOutcome, firstRenewalOnOrAfterEnforcement } = params;
  let expiryDateWithCap = expirationDate;
  let renewalDateWithCap = willRenew ? expirationDate : new Date(0);

  // If the private server is over the Plus free cap and going to auto-expire
  if (benefitCapOutcome === "expires" && firstRenewalOnOrAfterEnforcement !== undefined) {
    // Expiry date is whichever comes first: the original expiration or the first renewal on or after enforcement.
    expiryDateWithCap =
      !willRenew && expirationDate < firstRenewalOnOrAfterEnforcement
        ? expirationDate
        : firstRenewalOnOrAfterEnforcement;
    // If the server is auto-expiring, it won't renew after enforcement.
    renewalDateWithCap = new Date(0);
  }

  return { expiryDateWithCap, renewalDateWithCap };
};

// Determines which servers will lose their Plus benefit from being over the Plus free private server benefit cap.
// The first servers which are over the cap in each universe expire/renew as paid until the remaining servers are under the cap.
// Expiration vs renew as paid is determined by if the server was purchased before or after the user had Plus
export const annotateBenefitCapOutcome = (
  servers: MyPrivateServerResponse[],
  settings: GetPrivateServersSystemSettingsResponse,
): PrivateServerWithBenefitCap[] => {
  const { plusFreePrivateServerCap } = settings;

  // Compute each server's first post-enforcement renewal once, up front, so the sort below reads a
  // stored value instead of recomputing it on every comparison.
  const withRenewal: PrivateServerWithBenefitCap[] = servers.map(server => ({
    ...server,
    benefitCapOutcome: "none",
    firstRenewalOnOrAfterEnforcement: firstRenewalOnOrAfter(server, settings.enforcementStartDate),
  }));

  const plusFreeByUniverse = new Map<number, PrivateServerWithBenefitCap[]>();
  withRenewal.forEach(server => {
    if (
      !isPlusFreeServer(server) ||
      !survivesUntilPlusCapEnforcement(server, settings.enforcementStartDate)
    ) {
      return;
    }
    const group = plusFreeByUniverse.get(server.universeId) ?? [];
    group.push(server);
    plusFreeByUniverse.set(server.universeId, group);
  });

  const overCapIds = new Set<number>();
  for (const group of plusFreeByUniverse.values()) {
    if (group.length <= plusFreePrivateServerCap) {
      continue;
    }
    const sortedSoonestFirst = group.toSorted((a, b) => {
      const renewalDiff =
        a.firstRenewalOnOrAfterEnforcement.getTime() - b.firstRenewalOnOrAfterEnforcement.getTime();
      return renewalDiff !== 0 ? renewalDiff : a.privateServerId - b.privateServerId;
    });
    sortedSoonestFirst
      .slice(0, group.length - plusFreePrivateServerCap)
      .forEach(server => overCapIds.add(server.privateServerId));
  }

  return withRenewal.map(server => {
    let benefitCapOutcome: BenefitCapOutcome = "none";
    if (overCapIds.has(server.privateServerId)) {
      // Previously-paid servers (no RobloxSubscription tag) revert to paid; subscription-granted free servers expire.
      benefitCapOutcome = hasRobloxSubscriptionTag(server) ? "expires" : "becomesPaid";
    }
    return { ...server, benefitCapOutcome };
  });
};
