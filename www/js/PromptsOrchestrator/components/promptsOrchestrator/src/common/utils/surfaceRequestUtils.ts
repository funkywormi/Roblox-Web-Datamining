import { SURFACE_CONFIGS, type SurfaceConfig } from "../constants/surfaceConfig";
import type { PromptEntryPoint } from "../constants/promptEntryPointConstants";
import type { ClientAttributes } from "../types/promptTypes";
import { buildConfigKey } from "./stringBuilderUtils";

export type SurfaceRequestConfig = SurfaceConfig & {
  configKey: string;
};

export const getSurfaceRequestConfig = (
  entryPoint: PromptEntryPoint,
  clientAttributes?: ClientAttributes,
): SurfaceRequestConfig => {
  const surfaceConfig = SURFACE_CONFIGS[entryPoint];
  const configKey = buildConfigKey(entryPoint, clientAttributes);

  return { ...surfaceConfig, configKey };
};
