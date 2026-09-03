export type TicketRouteParams = {
  universeId: string;
  ticketId: string;
};

const routes = {
  defaultRoute: "/",
  ticketRoute: "/tickets/:universeId/:ticketId",
  getTicketRoute: (universeId: number, ticketId: string): string =>
    `/tickets/${universeId}/${encodeURIComponent(ticketId)}`,
};

export default routes;
