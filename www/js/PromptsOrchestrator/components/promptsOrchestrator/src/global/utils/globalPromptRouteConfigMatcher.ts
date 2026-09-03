import { globalPromptRouteConfig } from "../globalPromptRouteConfig";
import type { MatchedGlobalPromptRouteConfig } from "../types";

/**
 * Returns the prompt context for the first route that matches the path.
 *
 * Client attributes are limited to the path parameters requested by that route.
 * Returns undefined when no route matches.
 */
export const matchGlobalPromptRouteConfig = (
  path: string,
  routeConfig = globalPromptRouteConfig,
): MatchedGlobalPromptRouteConfig | undefined => {
  for (const config of routeConfig) {
    const result = config.match(path);
    if (!result) {
      continue;
    }

    const entries: [string, string][] = [];
    for (const param of config.clientAttributePathParams ?? []) {
      const value = result.params[param];
      // only strings are supported for client attributes
      if (typeof value === "string") {
        entries.push([param, value]);
      }
    }

    return {
      entryPoint: config.entryPoint,
      clientAttributes: entries.length > 0 ? Object.fromEntries(entries) : undefined,
    };
  }

  return undefined;
};
