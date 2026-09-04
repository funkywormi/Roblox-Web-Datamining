import { useEffect, useMemo } from "react";
import { GetEligiblePromptsResponseSchema, type ApiRequestConfig } from "@rbx/sdui-core";
import { useSduiCacheSubscription } from "@rbx/sdui-core/client";
import { PromptEntry } from "../types/promptTypes";
import { PromptStyle } from "../constants/promptStyleConstants";
import { mapPageEntriesToPromptEntries } from "../utils/promptEntryUtils";
import { usePromptsUrl } from "./usePromptsUrl";
import type { PromptEntryPoint } from "../constants/promptEntryPointConstants";
import type { AppPage } from "../constants/pageConstants";
import { getSduiApiStore } from "../services/sduiServices";

export type UsePromptEntriesInput<S extends PromptStyle> = {
  /**
   * Where the request is coming from
   */
  entryPoint: PromptEntryPoint;
  /**
   * Used for analytics scope
   */
  surfaceKey: string;
  /**
   * This is the key used to reference the request in the SDUI API store
   */
  configKey: string;
  /**
   * Client-specific attributes to add to the request
   */
  clientAttributes?: Record<string, string>;
  /**
   * Groups the entries returned by Prompts service by these prompt styles.
   * Needs to be a stable array reference (memoized)
   */
  promptStyles: readonly S[];
  /**
   * Used for retrieving page services
   */
  appPage: AppPage;
};

/**
 * Fetches prompts for a surface and groups the matching entries by the
 * requested prompt styles
 *
 * @returns an object with the requested prompt styles as keys and the matching entries as values
 * @example
 * const obj = usePromptEntries({
 *   entryPoint: PromptEntryPoint.CommunityPageOpen,
 *   surfaceKey: "MockSurfaceKey",
 *   configKey: "MockConfigKey",
 *   promptStyles: [PromptStyle.CardContainer],
 * });
 * console.log(obj.CardContainer);
 * >> [{ /** PromptEntry *\/ }]
 */
export const usePromptEntries = <const S extends PromptStyle>({
  entryPoint,
  surfaceKey,
  configKey,
  clientAttributes,
  promptStyles,
  appPage,
}: UsePromptEntriesInput<S>): Record<S, PromptEntry[]> => {
  const promptsUrl = usePromptsUrl(entryPoint, clientAttributes);

  const apiStore = getSduiApiStore(appPage);

  useEffect(() => {
    const doFetch = async () => {
      const request: ApiRequestConfig = {
        url: promptsUrl,
        surfaceKey,
        configKey,
        clearOnEmptyResponse: true,
        allowNoConfigsBuilt: true,
        responseFormat: "protobuf",
        protoSchema: GetEligiblePromptsResponseSchema,
      };

      await apiStore.fetchIfNeeded(request);
    };

    void doFetch();
  }, [surfaceKey, configKey, promptsUrl, apiStore]);

  const cacheEntry = useSduiCacheSubscription(apiStore, configKey);

  return useMemo(() => {
    // Seed every requested style so callers can always index/iterate the key,
    // even when no entry matches (value stays an empty array).
    const grouped: Record<string, PromptEntry[]> = {};
    for (const style of promptStyles) {
      grouped[style] = [];
    }

    for (const entry of mapPageEntriesToPromptEntries(cacheEntry)) {
      const { promptStyle } = entry;
      if (promptStyle !== undefined && Object.hasOwn(grouped, promptStyle)) {
        grouped[promptStyle]?.push(entry);
      }
    }

    return grouped;
  }, [cacheEntry, promptStyles]);
};
