import { EnvironmentUrls } from "@rbx/environment-urls";
import { APICall, HTTPVerb, withApiEvents } from "../utils/apiEventsCounter";

export type GetClientAssertionResponse = {
  clientAssertion: string;
};

export type GetAuthTicketResponse = string;

const getClientAssertion = async (): Promise<GetClientAssertionResponse | undefined> =>
  withApiEvents<GetClientAssertionResponse>(HTTPVerb.GET, APICall.GET_CLIENT_ASSERTION_V2, {
    url: `${EnvironmentUrls.authApi}/v1/client-assertion/`,
    withCredentials: true,
  });

const getAuthTicketInternal = async (
  clientAssertion: string | undefined,
): Promise<GetAuthTicketResponse | undefined> =>
  withApiEvents<GetAuthTicketResponse>(
    HTTPVerb.POST,
    APICall.GET_AUTH_TICKET_V2,
    {
      url: `${EnvironmentUrls.authApi}/v1/authentication-ticket/`,
      withCredentials: true,
    },
    {
      clientAssertion,
    },
    (_, headers) => headers["rbx-authentication-ticket"],
  );

export const getAuthTicket = async (): Promise<string | undefined> => {
  const clientAssertionResp = await getClientAssertion();
  return getAuthTicketInternal(clientAssertionResp?.clientAssertion);
};
