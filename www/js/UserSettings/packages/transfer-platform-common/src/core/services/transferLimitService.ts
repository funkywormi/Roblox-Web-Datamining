import type { GetUserTransferLimitResponse } from "@rbx/client-transfer-api/v1";
import { robuxTransferApiClient } from "../clients/transferApiClient";

/**
 * Reads the signed-in user's tier transfer ceilings.
 *
 * These are the limits the user's elevation status implies and take no account of
 * a parent-configured cap. The Robux tab composes the two itself — see
 * `isRobuxTransferLimitParentBound` and `clampRobuxTransferLimitsToTier` — so
 * anything reading `dailyLimit` or `monthlyLimit` as the caps actually in force
 * would be wrong for a user whose parent caps them.
 */
export const getUserTransferLimit = async (): Promise<GetUserTransferLimitResponse> =>
  robuxTransferApiClient.robuxTransferGetUserTransferLimit();
