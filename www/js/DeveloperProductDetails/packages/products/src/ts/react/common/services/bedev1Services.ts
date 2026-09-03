import { AxiosResponse } from '@rbx/core-scripts/http';
import { dataStores } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import { TGetGameDetails } from '../types/bedev1Types';

const { gamesDataStore } = dataStores;

export const getGameDetails = async (universeId: string): Promise<TGetGameDetails> => {
  const response = await gamesDataStore.getGameDetails([Number(universeId)]);
  const {
    data: { data }
  } = response as unknown as AxiosResponse<{
    data: TGetGameDetails[];
  }>;
  return data[0]!;
};

export default { getGameDetails };
