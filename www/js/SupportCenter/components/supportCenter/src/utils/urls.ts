import environmentUrls from "@rbx/environment-urls";

const { apiGatewayUrl, websiteUrl } = environmentUrls;

export const getUserTicketsUrl = ({ cursor }: { cursor?: string }): string => {
  const params = new URLSearchParams();
  if (cursor) {
    params.append("pageToken", cursor);
  }
  params.append("pageSize", "10"); // TODO: support variable page size
  return `${apiGatewayUrl}/creator-communication/v1beta1/creator-communication-api/user-tickets?${params.toString()}`;
};

export const getUserTicketUrl = ({
  universeId,
  ticketId,
}: {
  universeId: number;
  ticketId: string;
}): string => {
  return `${apiGatewayUrl}/creator-communication/v1beta1/creator-communication-api/universes/${universeId}/tickets/${ticketId}`;
};

export const getUserTicketViewedUrl = ({
  universeId,
  ticketId,
}: {
  universeId: number;
  ticketId: string;
}): string => {
  return `${apiGatewayUrl}/creator-communication/v1beta1/creator-communication-api/universes/${universeId}/tickets/${ticketId}/viewed`;
};

export const getGameDetailsUrl = (universeIds: number[]): string => {
  const uniqueUniverseIds = [...new Set(universeIds)];
  return `${environmentUrls.gamesApi}/v1/games?universeIds=${uniqueUniverseIds.join(",")}`;
};

export const getShareUserIdPreferenceUrl = ({
  universeId,
  ticketId,
}: {
  universeId: number;
  ticketId: string;
}): string => {
  return `${apiGatewayUrl}/creator-communication/v1beta1/creator-communication-api/universes/${universeId}/tickets/${ticketId}/share-user-id`;
};

export const getForumPostUrl = ({
  groupId,
  categoryId,
  postId,
}: {
  groupId: number;
  categoryId: string;
  postId: string;
}): string => {
  // we use shortened names in forum URLs to make links more readable / friendly to the user
  // we don't have the names of posts available, so we just use letters (g, c, p) as placeholders
  return `${websiteUrl}/communities/${groupId}/g#!/forums/c-${categoryId}/post/p-${postId}`;
};
