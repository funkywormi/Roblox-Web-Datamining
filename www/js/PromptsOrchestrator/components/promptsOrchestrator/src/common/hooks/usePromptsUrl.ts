import { useMemo } from "react";
import { Url } from "@rbx/core-lib/url";
import { PROMPTS_URL } from "../constants/urlConstants";
import { serializeClientAttributes } from "../utils/stringSerializerUtils";

export const usePromptsUrl = (
  entryPoint: string,
  clientAttributes?: Record<string, string>,
): Url => {
  // This is separated out as a guardrail for clients that do not memoize the
  // clientAttributes object. If the clientAttributes attributes stay the same, the
  // resulting string will be the same, and it won't matter that the
  // clientAttributes object reference changes.
  const serializedClientAttributes = useMemo(() => {
    return serializeClientAttributes(clientAttributes);
  }, [clientAttributes]);

  const promptsUrl = useMemo(() => {
    const tempUrl = Url.parse(PROMPTS_URL).getOrThrow();

    const searchParams: Record<string, string> = { entryPoint };
    if (serializedClientAttributes) {
      searchParams.clientAttributes = serializedClientAttributes;
    }

    return tempUrl.withSearchParams(searchParams);
  }, [entryPoint, serializedClientAttributes]);

  return promptsUrl;
};
