import { useQuery } from "@tanstack/react-query";
import { chatQueryKeys } from "../../../constants/queryKeys";
import { resolveGameShareLink } from "../../../services/gameShareLinkService";
import type { TGameShareLink } from "../../../utils/gameLinkCard";
import GameCard from "./GameCard";

const ShareLinkGameCard = ({
  shareLink,
  url,
  conversationId,
}: {
  shareLink: TGameShareLink;
  url: string;
  conversationId: string;
}) => {
  const { data } = useQuery({
    queryKey: chatQueryKeys.gameShareLink(shareLink.version, shareLink.linkId, shareLink.linkType),
    queryFn: () => resolveGameShareLink(shareLink),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  if (data?.type === "game") {
    return <GameCard {...data} url={url} conversationId={conversationId} isShareLink />;
  }
  // Pending, invalid or expired, network errors and non-game v2 links retain the original URL.
  return (
    <a href={url} className="text-body-small content-link react-chat-game-card-fallback-link">
      {url}
    </a>
  );
};

export default ShareLinkGameCard;
