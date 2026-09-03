import { AxiosPromise, httpService } from 'core-utilities';
import catalogConstants from '../constants/catalogConstants';

export type GetVngShopUrlResponse = {
  vngShopRedirectUrl: string;
};

class VngPaymentsService {
  static getVngShopSignedUrl(): AxiosPromise<GetVngShopUrlResponse> {
    return httpService.get<GetVngShopUrlResponse>(catalogConstants.endpoints.getSignedVngShopUrl);
  }
}

export default VngPaymentsService;
