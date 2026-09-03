/**
 * Retrieves the GUAC configuration for the new abuse reporting revamp flow and the new report abuse URL.
 * Multiple copies of this file exists in the codebase, give that there currently is not a way to share code across WebApps.
 * If updating this file, please report all the copies in the codebase.
 */
import { Guac } from 'Roblox';

type GuacResponse = {
  EnableSubscriptions?: boolean;
};

type GuacConfig = {
  EnableSubscriptions: boolean;
};

let responsePromise: Promise<GuacConfig> | null = null;

/**
 * Loads the GUAC (Great Universal App Configurator) configuration for abuse reporting, which functions as flags.
 * This function does not throw errors and returns a false configuration if the request fails.
 *
 * @returns A promise that resolves to a `GuacConfig` object containing:
 *   - `EnableSubscriptions`: A boolean indicating whether the subscriptions abuse report revamp feature is enabled.
 */
async function loadGuacConfigNonThrowing(): Promise<GuacConfig> {
  if (responsePromise) {
    return responsePromise;
  }

  try {
    const data = await Guac.callBehaviour<GuacResponse>('abuse-reporting-revamp');

    if (!data) {
      return {
        EnableSubscriptions: false
      };
    }

    responsePromise = Promise.resolve({
      EnableSubscriptions: Boolean(data.EnableSubscriptions)
    });
    return responsePromise;
  } catch (e) {
    return {
      EnableSubscriptions: false
    };
  }
}

export default {
  loadGuacConfigNonThrowing
};
