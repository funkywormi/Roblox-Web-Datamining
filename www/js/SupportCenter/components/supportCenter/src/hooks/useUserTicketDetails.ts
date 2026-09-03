import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useHistory, useLocation } from "react-router-dom";
import { useSupportCenterContext } from "../context/SupportCenterContext";
import routes from "../constants/routes";
import { getUserTicketDetails } from "../services/creatorCommunicationService";
import { getHttpErrorStatus } from "../utils/httpError";
import { GetTicketAsUserResponse } from "../types";

export const getUserTicketDetailsQueryKey = (universeId: number, ticketId: string) => {
  return ["user-ticket-details", universeId, ticketId] as const;
};

const useUserTicketDetails = ({
  universeId,
  ticketId,
}: {
  universeId: number;
  ticketId: string;
}) => {
  const history = useHistory();
  const location = useLocation();
  const { setIsTicketInaccessible } = useSupportCenterContext();

  const query = useQuery<GetTicketAsUserResponse>({
    retry: 1,
    queryKey: getUserTicketDetailsQueryKey(universeId, ticketId),
    queryFn: async () => getUserTicketDetails(universeId, ticketId),
    refetchOnWindowFocus: false,
  });

  // A non-author requesting someone else's ticket gets 404, not 403 — Treat both as "can't view" and
  // redirect to the support-center home, which shows the "back to forum post" banner.
  const errorStatus = query.isError ? getHttpErrorStatus(query.error) : undefined;
  const isTicketInaccessible = errorStatus === 403 || errorStatus === 404;

  useEffect(() => {
    if (query.isLoading) {
      return;
    }

    if (isTicketInaccessible) {
      setIsTicketInaccessible(true);
      history.replace({
        pathname: routes.defaultRoute,
        search: location.search,
      });
      return;
    }

    setIsTicketInaccessible(false);
  }, [query.isLoading, isTicketInaccessible, history, location.search, setIsTicketInaccessible]);

  return {
    ...query,
    isLoading: query.isLoading || isTicketInaccessible,
    isError: query.isError && !isTicketInaccessible,
  };
};

export default useUserTicketDetails;
