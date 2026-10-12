import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-lib/http";
import { serialize } from "@rbx/core-lib/json";
import { Url } from "@rbx/core-lib/url";

// Built per call so importing never throws where a base URL is missing, and trimmed because
// withPath would drop matchmakingApi's /matchmaking-api base path and Next hosts end in "/".
const apiUrl = (base: string, path: string) =>
  Url.parse(`${base.replace(/\/+$/, "")}${path}`).getOrThrow();

export const resetClientStatus = async (): Promise<void> => {
  (
    await http.fetch(apiUrl(environmentUrls.matchmakingApi, "/v1/client-status"), {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: serialize({ status: "Unknown" }).value,
    })
  ).getOrThrow();
};

export const getAuthTicket = async (): Promise<string | undefined> => {
  const assertion = await http.getUntyped(
    apiUrl(environmentUrls.authApi, "/v1/client-assertion/"),
    { credentials: "include" },
  );
  const response = await http.fetch(apiUrl(environmentUrls.authApi, "/v1/authentication-ticket/"), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: serialize((assertion.isOk() ? assertion.value : null) ?? {}).getOrThrow(),
  });
  if (response.isErr()) {
    return undefined;
  }
  const ticket = response.value.headers.get("rbx-authentication-ticket");
  if (!ticket) {
    return undefined;
  }
  return ticket;
};
