import { AxiosResponse } from 'axios';
import { httpService } from 'core-utilities';
import aboutTabConstants from '../constants/socialLinksConstants';
import { TGetGameSocialLinksResponse } from '../types/socialLinksType';

const getGameSocialLinks = async (universeId: string): Promise<TGetGameSocialLinksResponse[]> => {
  const {
    data: { data }
  } = ((await httpService.get(
    aboutTabConstants.url.getGameSocialLinks(universeId)
  )) as unknown) as AxiosResponse<{ data: TGetGameSocialLinksResponse[] }>;
  return data;
};

export default {
  getGameSocialLinks
};
