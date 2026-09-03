import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";

export type ClientStatus =
  | "Unknown"
  | "BootstrapperInstalling"
  | "AppStarted"
  | "AcquiringGame"
  | "JoiningGame"
  | "InGame"
  | "LeftGame";

export const clientStatus = async () =>
  (
    await http.get<{ status: ClientStatus }>({
      url: `${environmentUrls.matchmakingApi}/v1/client-status`,
      withCredentials: true,
    })
  ).data;

export const resetClientStatus = async () => {
  await http.post(
    { url: `${environmentUrls.matchmakingApi}/v1/client-status`, withCredentials: true },
    {
      status: "Unknown" satisfies ClientStatus,
    },
  );
};

export const getAuthTicket = async () => {
  let clientAssertion: unknown;
  try {
    ({ data: clientAssertion } = await http.get({
      url: `${environmentUrls.authApi}/v1/client-assertion/`,
      withCredentials: true,
    }));
  } catch {
    // do nothing
  }

  try {
    const response = await http.post(
      {
        url: `${environmentUrls.authApi}/v1/authentication-ticket/`,
        withCredentials: true,
      },
      clientAssertion ?? {},
    );
    const headers = response.headers as unknown;
    if (headers != null && typeof headers === "object") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      const authTicket = (headers as Record<string, unknown>)["rbx-authentication-ticket"];
      if (typeof authTicket === "string" && authTicket.length > 0) {
        return authTicket;
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
};
