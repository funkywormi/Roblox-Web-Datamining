import * as z from "zod/mini";
import * as http from "@rbx/core-lib/http";
import { Url } from "@rbx/core-lib/url";
import environmentUrls from "@rbx/environment-urls";

const { voiceApi } = environmentUrls;

const optUserInToVoiceChatResponseSchema = z.object({
  isUserOptIn: z.optional(z.boolean()),
});

export const optUserInToVoiceChat = async (
  isUserOptIn: boolean,
  isOptedInThroughUpsell: boolean,
) => {
  const url = Url.parse(`${voiceApi}/v1/settings/user-opt-in`).getOrThrow();
  const params = {
    isUserOptIn,
    isOptedInThroughUpsell,
  };
  return http
    .post(url, params, optUserInToVoiceChatResponseSchema, {
      credentials: "include",
      retry: http.defaultBrowserRetryDelay,
    })
    .getOrThrow();
};
