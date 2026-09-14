/**
 * Starts a verification check bound to an on-device-parent session, so completing it can authorize that session.
 */

import * as http from "@rbx/core-scripts/http";

import { START_ON_DEVICE_PARENT_VERIFICATION_URL } from "./constants";
import type {
  OnDeviceParentVerificationMethod,
  StartOnDeviceParentVerificationResponse,
} from "./types";

export async function startOnDeviceParentVerification(
  sessionId: string,
  method: OnDeviceParentVerificationMethod,
): Promise<StartOnDeviceParentVerificationResponse> {
  try {
    const response = await http.post<Partial<StartOnDeviceParentVerificationResponse>>(
      { url: START_ON_DEVICE_PARENT_VERIFICATION_URL, withCredentials: true },
      { sessionId, verificationType: method },
    );
    return {
      sessionIdentifier: response.data.sessionIdentifier ?? null,
      verificationLink: response.data.verificationLink ?? null,
    };
  } catch (err) {
    throw new Error(
      `Failed to start on-device-parent verification: ${http.parseErrorCode(err) ?? "unknown"}`,
      { cause: err },
    );
  }
}
