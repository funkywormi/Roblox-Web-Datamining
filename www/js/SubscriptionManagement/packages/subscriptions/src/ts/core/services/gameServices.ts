import { EnvironmentUrls } from 'Roblox';
import { httpService } from 'core-utilities';

type GameInfoResponse = {
  data: {
    rootPlaceId: number;
  }[];
};

export const getExperiencePlaceId = async (universeId: string): Promise<number | null> => {
  try {
    const { data } = await httpService.get<GameInfoResponse>({
      url: `${EnvironmentUrls.gamesApi}/v1/games`,
      withCredentials: true
    }, { universeIds: [universeId] });
    return data.data?.[0]?.rootPlaceId ?? null;
  } catch {
    return null;
  }
};

export default { getExperiencePlaceId };
