import { useQuery } from "@tanstack/react-query";
import environmentUrls from "@rbx/environment-urls";
import { chatQueryKeys } from "../constants/queryKeys";
import chatHttpTransport from "../services/chatHttpTransport";

export const useGameStats = (universeId: number | undefined) =>
  useQuery({
    queryKey: chatQueryKeys.gameStats(universeId),
    queryFn: async () => {
      const [games, votes] = await Promise.all([
        chatHttpTransport.get<{ data: { id: number; playing: number }[] }>(
          { url: `${environmentUrls.gamesApi}/v1/games`, withCredentials: true },
          { universeIds: universeId },
        ),
        chatHttpTransport.get<{ data: { id: number; upVotes: number; downVotes: number }[] }>(
          { url: `${environmentUrls.gamesApi}/v1/games/votes`, withCredentials: true },
          { universeIds: universeId },
        ),
      ]);
      const game = games.data.find(item => item.id === universeId);
      const vote = votes.data.find(item => item.id === universeId);
      const totalVotes = vote ? vote.upVotes + vote.downVotes : 0;
      return {
        playing: game?.playing,
        rating: vote && totalVotes > 0 ? Math.round((100 * vote.upVotes) / totalVotes) : undefined,
      };
    },
    enabled: universeId != null,
    staleTime: 60 * 1000,
  });
