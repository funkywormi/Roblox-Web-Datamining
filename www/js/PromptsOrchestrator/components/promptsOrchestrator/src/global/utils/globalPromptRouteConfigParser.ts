import { match } from "path-to-regexp";
import type { SupportedRoute } from "../types";

export const parseGlobalPromptRouteConfig = (config: SupportedRoute[]) => {
  return config.map(item => {
    return {
      match: match(item.path, item.matchOptions),
      entryPoint: item.entryPoint,
      clientAttributePathParams: item.clientAttributePathParams,
    };
  });
};
