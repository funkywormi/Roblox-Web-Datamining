/**
 * Retrieves the GUAC configuration for the app policy bundle.
 * Multiple copies of this file exist in the codebase given that there currently is not a way
 * to share code across WebApps. If updating this file, please update all copies in the codebase.
 */
import { Guac } from "@rbx/legacy-webapp-types/Roblox";

type AppPolicyResponse = {
  /**
   * `true` = hide Roblox Plus entrypoints. For the “off” / default case GUAC may omit this key
   * or set it to `null` or `false` (often omitted in network JSON) — all are treated as “allow”.
   */
  DisableRobloxPlusEntrypoints?: boolean | null;
};

let responsePromise: Promise<boolean> | null = null;

function shouldDisableRobloxPlusEntrypointsFromAppPolicy(
  data: AppPolicyResponse | null | undefined,
): boolean {
  return data?.DisableRobloxPlusEntrypoints === true;
}

/**
 * Loads the GUAC (Great Universal App Configurator) configuration for the app policy.
 * This function does not throw errors and returns false if the request fails.
 *
 * @returns `true` only when `DisableRobloxPlusEntrypoints === true` (omitted / null are not
 *   treated as “disable”, matching typical GUAC emission).
 */
export function getDisableRobloxPlusEntrypoints(): Promise<boolean> {
  if (responsePromise) {
    return responsePromise;
  }

  responsePromise = (async () => {
    try {
      const data = await Guac.callBehaviour<AppPolicyResponse>("app-policy");
      return shouldDisableRobloxPlusEntrypointsFromAppPolicy(data);
    } catch {
      return false;
    }
  })();

  return responsePromise;
}
