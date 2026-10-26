import ExperimentationService from "@rbx/experimentation";
import { type PrivateServer, SubscriptionStatus } from "@rbx/client-private-servers-api-v2/v2";
import type { MyPrivateServerResponse } from "../types/privateServerTypes";

export const vipServersWebLayer = "VIPServers.Web";
export const isPrivateServersV2EnabledParam = "IsPrivateServersV2Enabled";

let isPrivateServersV2EnabledPromise: Promise<boolean> | undefined;

const readIsPrivateServersV2Enabled = async (): Promise<boolean> => {
  try {
    const values = await ExperimentationService.getAllValuesForLayer(vipServersWebLayer);
    return values?.[isPrivateServersV2EnabledParam] === true;
  } catch {
    return false;
  }
};

/**
 * Reads the IXP rollout gating the v2 private servers list; any failure keeps v1.
 * Resolved once per page load: getAllValuesForLayer is uncached, and list refetches must not repeat it.
 */
export const getIsPrivateServersV2Enabled = (): Promise<boolean> => {
  isPrivateServersV2EnabledPromise ??= readIsPrivateServersV2Enabled();
  return isPrivateServersV2EnabledPromise;
};

export const resetPrivateServersV2GateForTesting = (): void => {
  isPrivateServersV2EnabledPromise = undefined;
};

/** Maps a v2 private server onto the row shape the page renders for v1. */
export const mapPrivateServerV2ToResponse = (server: PrivateServer): MyPrivateServerResponse => {
  const discounts = server.renewalPrice?.discounts ?? [];
  return {
    active: server.joinEnabled,
    expirationDate: server.expirationTime,
    privateServerId: server.id,
    name: server.serverName,
    ownerId: server.ownerUserId,
    ownerName: server.ownerUsername,
    placeId: server.rootPlaceId,
    priceInRobux: server.renewalPrice?.priceInRobux ?? null,
    universeId: server.universeId,
    universeName: server.universeName,
    willRenew: server.status === SubscriptionStatus.Active && server.hasPurchaseSchedule,
    // v1 only returned this for its own cancel flow; nothing on this page reads it.
    purchaseScheduleId: null,
    totalDiscountAmountInRobux:
      discounts.length > 0 ? discounts.reduce((sum, discount) => sum + discount.amount, 0) : null,
    metadata: { privateServerSubscriptionTags: server.metadataTags },
  };
};
