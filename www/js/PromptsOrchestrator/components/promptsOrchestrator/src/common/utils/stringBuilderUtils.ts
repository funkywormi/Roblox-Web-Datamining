import type { ClientAttributes } from "../types/promptTypes";
import { serializeClientAttributes } from "./stringSerializerUtils";

const PROMPTS_KEY = "Prompts";

export const buildSurfaceKey = (suffix: string) => `${PROMPTS_KEY}:${suffix}`;

/**
 * Builds a config key used for SDUI's cache key. Client attributes are included
 * in the key because they are used to determine if prompts should be displayed.
 * If the client attributes change, we cannot use the cached value because it
 * may be wrong
 */
export const buildConfigKey = (suffix: string, clientAttributes?: ClientAttributes) => {
  let configKey = `${PROMPTS_KEY}:${suffix}`;

  if (clientAttributes) {
    const serializedClientAttributes = serializeClientAttributes(clientAttributes);

    if (serializedClientAttributes) {
      configKey += `-${serializedClientAttributes}`;
    }
  }

  return configKey;
};

/**
 * Converts a record of tags to a string for logging. This does not filter out
 * undefined values because knowing that a value is undefined can be useful for debugging
 *
 * @example
 * buildTagsForLogging({ appPage: "prompts-orchestrator", promptType: "test" })
 * => "[appPage=prompts-orchestrator][promptType=test]"
 */
export const buildTagsForLogging = (tags: Record<string, string | undefined>) => {
  return Object.entries(tags)
    .map(([key, value]) => `[${key}=${value}]`)
    .join("");
};
