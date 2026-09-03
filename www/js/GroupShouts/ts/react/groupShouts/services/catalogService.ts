import { httpService } from 'core-utilities';
import { CatalogItemDetails } from '../types';
import groupAnnouncementsConstants from '../constants/groupAnnouncementsConstants';

export default {
  getCatalogItemDetails: async (itemType: string, id: number): Promise<CatalogItemDetails> => {
    const urlConfig = {
      url: groupAnnouncementsConstants.urls.getCatalogItemDetailsUrl(itemType, id),
      withCredentials: true
    };

    const { data } = await httpService.get(urlConfig);
    return data as CatalogItemDetails;
  }
};
