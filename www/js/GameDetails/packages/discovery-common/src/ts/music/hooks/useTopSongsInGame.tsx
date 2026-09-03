import { useQuery } from "@tanstack/react-query";
import type { Song } from "@rbx/clients/musicDiscovery/v1";
import { fetchTopSongsInGame } from "../services/musicDiscoveryService";

export const topSongsInGameQueryKeys = {
  topSongs: (universeId: string) => ["topSongsInGame", universeId] as const,
};

type SongWithAssetId = Song & { assetId: number };

const filterValidSongs = (songs: Song[] | undefined): SongWithAssetId[] =>
  (songs ?? []).filter((song): song is SongWithAssetId => song.assetId != null);

const useTopSongsInGame = (universeId: string) =>
  useQuery({
    queryKey: topSongsInGameQueryKeys.topSongs(universeId),
    queryFn: () => fetchTopSongsInGame(universeId),
    enabled: Boolean(universeId),
    select: ({ songs: fetchedSongs }) => filterValidSongs(fetchedSongs),
  });

export default useTopSongsInGame;
