import { PromptEntryPoint } from "../common/constants/promptEntryPointConstants";
import type { SupportedRoute } from "./types";
import { parseGlobalPromptRouteConfig } from "./utils/globalPromptRouteConfigParser";

/**
 * Route config that maps URLs to global prompt configs. First match wins, meaning
 * generic routes should be placed towards the end of the array.
 *
 * @example Exact matching for `path: "/home"` (`end: true`)
 * - `trailing: true` matches `/home` and `/home/`.
 * - `trailing: false` matches only `/home`.
 * - Neither matches `/home///` or `/home/profile`.
 *
 * @example Prefix matching for `path: "/home"` (`end: false`)
 * Both `trailing` values match `/home`, `/home/`, `/home///`, and
 * `/home/profile`, but not `/homepage`.
 *
 * @example Using path parameters as client attributes
 * For `path: "/communities/:communityId/users/:userId"`, setting
 * `clientAttributePathParams: ["communityId"]` maps `/communities/123/users/456`
 * to client attributes `{ communityId: "123" }`.
 */
const clientRouteConfig = [
  {
    path: "/home",
    entryPoint: PromptEntryPoint.HomepageLaunchWeb,
    clientAttributePathParams: undefined,
    matchOptions: {
      end: true,
      trailing: true,
      sensitive: false,
    },
  },
] satisfies SupportedRoute[];

export const globalPromptRouteConfig = parseGlobalPromptRouteConfig(clientRouteConfig);
