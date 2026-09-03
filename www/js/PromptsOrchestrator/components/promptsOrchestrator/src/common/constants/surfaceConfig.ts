import { buildSurfaceKey } from "../utils/stringBuilderUtils";
import { AppPage } from "./pageConstants";
import { PromptEntryPoint } from "./promptEntryPointConstants";

export type SurfaceConfig = {
  /**
   * enum used for analytics and retrieving page services
   */
  appPage: AppPage;
  /**
   * surface-level analytics key — typically the same as AppPage, but prefixed with the prompts key
   * @example "Prompts:Communities"
   */
  surfaceKey: string;
};

/**
 * To register a new entry point, add a row below with all fields
 * filled in explicitly. There are no defaults; "be explicit" is cheaper
 * to read than chasing a defaulting rule when something is wrong.
 */
export const SURFACE_CONFIGS = {
  [PromptEntryPoint.CommunityPageOpen]: {
    appPage: AppPage.Communities,
    surfaceKey: buildSurfaceKey(AppPage.Communities),
  },
  [PromptEntryPoint.HomepageLaunchWeb]: {
    appPage: AppPage.Home,
    surfaceKey: buildSurfaceKey(AppPage.Home),
  },
} as const satisfies Record<PromptEntryPoint, SurfaceConfig>;
