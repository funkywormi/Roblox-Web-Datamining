import * as http from "@rbx/core-scripts/http";
import {
  GetTicketAsUserResponse,
  ListUserTicketSummariesResponse,
  SetShareUserIdPreferenceResponse,
  ShareUserIdPreference,
  UpdateViewedByUserResponse,
} from "../types";
import {
  getUserTicketsUrl,
  getUserTicketUrl,
  getShareUserIdPreferenceUrl,
  getUserTicketViewedUrl,
} from "../utils/urls";

const getUserTickets = async ({
  cursor,
}: {
  cursor?: string;
}): Promise<ListUserTicketSummariesResponse> => {
  const urlConfig = {
    url: getUserTicketsUrl({ cursor }),
    withCredentials: true,
  };

  const response = await http.get<ListUserTicketSummariesResponse>(urlConfig);

  return response.data;
};

const getUserTicketDetails = async (universeId: number, ticketId: string) => {
  const urlConfig = {
    url: getUserTicketUrl({ universeId, ticketId }),
    withCredentials: true,
  };

  const response = await http.get<GetTicketAsUserResponse>(urlConfig);

  return response.data;
};

const updateUserTicket = async (
  universeId: number,
  ticketId: string,
  message: string,
  idempotencyKey: string,
) => {
  const urlConfig = {
    url: getUserTicketUrl({ universeId, ticketId }),
    withCredentials: true,
  };

  const response = await http.patch<GetTicketAsUserResponse>(urlConfig, {
    response: message,
    idempotencyKey,
  });

  return response.data;
};

const markTicketViewedByUser = async (universeId: number, ticketId: string) => {
  const urlConfig = {
    url: getUserTicketViewedUrl({ universeId, ticketId }),
    withCredentials: true,
  };

  const response = await http.patch<UpdateViewedByUserResponse>(urlConfig, {
    viewedByUser: true,
  });

  return response.data;
};

const setShareUserIdPreference = async (
  universeId: number,
  ticketId: string,
  shareUserId: ShareUserIdPreference,
  idempotencyKey: string,
) => {
  const urlConfig = {
    url: getShareUserIdPreferenceUrl({ universeId, ticketId }),
    withCredentials: true,
  };

  const response = await http.patch<SetShareUserIdPreferenceResponse>(urlConfig, {
    shareUserId,
    idempotencyKey,
  });

  return response.data;
};

export {
  getUserTickets,
  getUserTicketDetails,
  updateUserTicket,
  markTicketViewedByUser,
  setShareUserIdPreference,
};
