/**
 * Retrieves the GUAC configuration for the new abuse reporting revamp flow and the new report abuse URL.
 * Multiple copies of this file exists in the codebase, give that there currently is not a way to share code across WebApps.
 * If updating this file, please report all the copies in the codebase.
 */
import { callBehaviour } from "@rbx/core-scripts/guac";

type GuacResponse = {
  EnableDevProducts?: boolean;
};

type GuacConfig = {
  EnableDevProducts: boolean;
};

/**
 * Loads the GUAC (Great Universal App Configurator) configuration for abuse reporting, which functions as flags.
 * This function does not throw errors and returns a false configuration if the request fails.
 *
 * @returns A promise that resolves to a `GuacConfig` object containing:
 *   - `EnableDevProducts`: A boolean indicating whether the dev product reporting feature is enabled.
 */
async function loadGuacConfigNonThrowing(): Promise<GuacConfig> {
  try {
    const data = await callBehaviour<GuacResponse>('abuse-reporting-revamp');

    if (!data) {
      return {
        EnableDevProducts: false
      };
    }

    return {
      EnableDevProducts: Boolean(data.EnableDevProducts)
    };
  } catch (e) {
    return {
      EnableDevProducts: false
    };
  }
}

export default {
  loadGuacConfigNonThrowing
};
