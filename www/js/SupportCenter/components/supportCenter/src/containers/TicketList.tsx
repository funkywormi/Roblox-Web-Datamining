import React, { useCallback } from "react";
import { Loading } from "@rbx/core-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { List } from "@rbx/foundation-ui";
import useUserTicketSummaries from "../hooks/useUserTicketSummaries";
import TicketListItem from "../components/TicketListItem";
import PageControls from "../components/PageControls";
import TicketListEmptyState from "../components/TicketListEmptyState";
import TicketListErrorState from "../components/TicketListErrorState";
import useGameDetailsByUniverseIds from "../hooks/useGameDetailsByUniverseIds";
import { useSupportCenterContext } from "../context/SupportCenterContext";

const TicketList: React.FC = () => {
  const { translate } = useTranslation();
  const { currentPageIndex, setCurrentPageIndex } = useSupportCenterContext();

  const {
    data,
    fetchNextPage,
    isInitialLoading: isInitialTicketsLoading,
    isFetching: isFetchingTickets,
    isError: isErrorTickets,
    hasNextPage,
    refetch: refetchTickets,
  } = useUserTicketSummaries();

  const onPageChanged = useCallback(
    async (newPageIndex: number) => {
      setCurrentPageIndex(newPageIndex);
      if (!data?.pages[newPageIndex]) {
        await fetchNextPage();
      }
    },
    [fetchNextPage, data?.pages, setCurrentPageIndex],
  );

  const universeIdsOnCurrentPage =
    data?.pages[currentPageIndex]?.userTicketSummaries.map(ticket => ticket.universeId) ?? [];

  const { data: gameDetailsByUniverseIds, isFetching: isFetchingGameDetails } =
    useGameDetailsByUniverseIds(universeIdsOnCurrentPage);

  const maxPageIndex = data?.pages ? data.pages.length - 1 : 0;
  const currentPage = data?.pages[currentPageIndex];
  const hasAnyTickets = Boolean(data?.pages.some(page => page.userTicketSummaries.length > 0));

  const isFetching = isFetchingTickets || isFetchingGameDetails;
  const isError = isErrorTickets; // only consider ticket summaries request for error state since game details are non-essential

  if (isError) {
    // eslint-disable-next-line no-void
    return <TicketListErrorState onClick={() => void refetchTickets()} />;
  }

  if (isInitialTicketsLoading) {
    // if it's first load, don't display pagination controls since we don't know the user has any tickets
    return <Loading className="height-[200px]" />;
  }

  if (!hasAnyTickets) {
    return <TicketListEmptyState />;
  }

  return (
    <div className="margin-y-medium">
      {!isFetching && (
        <List className="radius-large stroke-standard stroke-default clip">
          {currentPage?.userTicketSummaries.map((ticket, index) => (
            <TicketListItem
              key={ticket.id}
              id={ticket.id}
              title={ticket.title}
              universeId={ticket.universeId}
              universeName={
                gameDetailsByUniverseIds?.get(ticket.universeId)?.name ??
                translate("Label.UnknownGame")
              }
              updateTime={ticket.updateTime}
              showUnreadIndicator={!ticket.viewedByUser}
              showDivider={index < currentPage.userTicketSummaries.length - 1}
            />
          ))}
        </List>
      )}
      {isFetching && <Loading className="height-[150px]" />}
      <PageControls
        pageIndex={currentPageIndex}
        onPageChanged={onPageChanged}
        hasPreviousPage={currentPageIndex > 0}
        hasNextPage={currentPageIndex < maxPageIndex || Boolean(hasNextPage)}
        disabled={isFetching || isError}
      />
    </div>
  );
};

export default TicketList;
