import { getAuthTicket } from "./authTicketService";

export const getAuthTicketData = async () => {
  const authTicket = await getAuthTicket();
  return authTicket ?? "";
};
