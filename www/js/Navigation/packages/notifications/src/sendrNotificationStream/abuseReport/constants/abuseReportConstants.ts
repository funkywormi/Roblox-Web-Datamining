/**
 * Retrieves the GUAC configuration for the new abuse reporting revamp flow and the new report abuse URL.
 * Multiple copies of this file exists in the codebase, give that there currently is not a way to share code across WebApps.
 * If updating this file, please report all the copies in the codebase.
 */
import { Guac } from "Roblox";

const REPORTER_COMMENT_LIMIT = 1000;
const ABUSE_REASONS = {
  VIOLATION_TYPE_BULLYING_AND_HARASSMENT: "VIOLATION_TYPE_BULLYING_AND_HARASSMENT",
  VIOLATION_TYPE_CHEATING_AND_EXPLOITS: "VIOLATION_TYPE_CHEATING_AND_EXPLOITS",
  VIOLATION_TYPE_DATING_AND_ROMANTIC: "VIOLATION_TYPE_DATING_AND_ROMANTIC",
  VIOLATION_TYPE_DIRECTING_USERS_OFF_PLATFORM: "VIOLATION_TYPE_DIRECTING_USERS_OFF_PLATFORM",
  VIOLATION_TYPE_OTHER: "VIOLATION_TYPE_OTHER",
  VIOLATION_TYPE_ASKING_FOR_PII: "VIOLATION_TYPE_ASKING_FOR_PII",
  VIOLATION_TYPE_SCAMS: "VIOLATION_TYPE_SCAMS",
  VIOLATION_TYPE_PROFANITY: "VIOLATION_TYPE_PROFANITY",
};

type GuacResponse = {
  EnableNotification?: boolean;
};

type GuacConfig = {
  EnableNotification: boolean;
};

/**
 * Retrieves the abuse report URL with the specified parameters.
 *
 * @param param0 - An object containing the following properties:
 *   - `targetId`: The Id of the target being reported (could be player, asset, postId, etc.).
 *   - `submitterId`: The Id of the user submitting the report.
 *   - `abuseVector`: The surface where the abuse is occurring (user_profile, group, avatar, etc.).
 * @returns The constructed abuse report URL as a string.
 */
export function getAbuseReportRevampUrl({
  targetId,
  submitterId,
  abuseVector,
}: {
  [key: string]: string;
}): string {
  const params = new URLSearchParams({
    targetId: targetId!,
    submitterId: submitterId!,
    abuseVector: abuseVector!,
  });
  return `/report-abuse/?${params.toString()}`;
}

/**
 * Loads the GUAC (Great Universal App Configurator) configuration for abuse reporting, which functions as flags.
 * This function does not throw errors and returns a false configuration if the request fails.
 *
 * @returns A promise that resolves to a `GuacConfig` object containing:
 *   - `EnableNotification`: A boolean indicating whether the abuse reporting feature is enabled.
 */
export async function loadGuacConfigNonThrowing(): Promise<GuacConfig> {
  try {
    const data = await Guac.callBehaviour<GuacResponse>("abuse-reporting-revamp");

    if (!data) {
      return {
        EnableNotification: false,
      };
    }

    return {
      EnableNotification: Boolean(data.EnableNotification),
    };
  } catch (e) {
    return {
      EnableNotification: false,
    };
  }
}

export { REPORTER_COMMENT_LIMIT, ABUSE_REASONS };
