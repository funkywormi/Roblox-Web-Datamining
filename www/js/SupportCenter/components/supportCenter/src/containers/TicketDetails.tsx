import React, { useCallback, useEffect } from "react";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { Loading } from "@rbx/core-ui";
import useUserTicketDetails from "../hooks/useUserTicketDetails";
import useGameDetailsByUniverseIds from "../hooks/useGameDetailsByUniverseIds";
import TicketListErrorState from "../components/TicketListErrorState";
import TicketActivityList from "../components/TicketActivityList";
import { markTicketViewedByUser } from "../services/creatorCommunicationService";
import { userTicketSummariesQueryKey } from "../hooks/useUserTicketSummaries";
import { ListUserTicketSummariesResponse } from "../types";

interface TicketDetailsProps {
  universeId: number;
  ticketId: string;
}

const TicketDetails: React.FC<TicketDetailsProps> = ({ universeId, ticketId }) => {
  const {
    data: ticketData,
    isLoading: isLoadingTicket,
    isError: isErrorTicket,
    refetch: refetchTicket,
  } = useUserTicketDetails({ universeId, ticketId });

  const {
    data: gameDetailsByUniverseIds,
    isLoading: isLoadingGameDetails,
    isError: isErrorGameDetails,
    refetch: refetchGameDetails,
  } = useGameDetailsByUniverseIds([universeId]);

  const queryClient = useQueryClient();

  const isLoading = isLoadingTicket || isLoadingGameDetails;
  const isError = isErrorTicket || isErrorGameDetails;
  const isEmpty = !ticketData?.userTicket.comments || ticketData.userTicket.comments.length === 0;
  const isAlreadyViewed = ticketData?.userTicket.summary.viewedByUser;

  const optimisticUpdateTicketViewedState = useCallback(
    (previousData: InfiniteData<ListUserTicketSummariesResponse> | undefined) => {
      if (!previousData) {
        return previousData;
      }

      return {
        ...previousData,
        pages: previousData.pages.map(page => ({
          ...page,
          userTicketSummaries: page.userTicketSummaries.map(summary =>
            summary.id === ticketId && summary.universeId === universeId
              ? { ...summary, viewedByUser: true }
              : summary,
          ),
        })),
      };
    },
    [ticketId, universeId],
  );

  useEffect(() => {
    if (!isLoading && !isError && !isEmpty && !isAlreadyViewed) {
      queryClient.setQueryData<InfiniteData<ListUserTicketSummariesResponse>>(
        userTicketSummariesQueryKey,
        optimisticUpdateTicketViewedState,
      );

      // eslint-disable-next-line no-void
      void markTicketViewedByUser(universeId, ticketId);
    }
  }, [
    universeId,
    ticketId,
    isLoading,
    isError,
    isEmpty,
    isAlreadyViewed,
    queryClient,
    optimisticUpdateTicketViewedState,
  ]);

  if (isLoading) {
    return <Loading className="height-[200px]" />;
  }

  const refetch = async () => {
    if (isErrorTicket) {
      await refetchTicket();
    }
    if (isErrorGameDetails) {
      await refetchGameDetails();
    }
  };

  if (isError || isEmpty) {
    // eslint-disable-next-line no-void
    return <TicketListErrorState onClick={() => void refetch()} />;
  }

  const gameDetails = gameDetailsByUniverseIds.get(universeId);

  return <TicketActivityList ticket={ticketData.userTicket} gameDetails={gameDetails} />;
};

export default TicketDetails;
