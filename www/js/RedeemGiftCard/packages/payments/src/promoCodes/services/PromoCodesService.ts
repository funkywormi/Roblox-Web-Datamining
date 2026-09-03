import { AxiosPromise } from "axios";
import { httpService } from "core-utilities";
import getRedeemUrlConfig from "../constants/urlConstants";

const redeemPromoCode = <T = unknown>(pin: string): AxiosPromise<T> => {
  const urlConfig = getRedeemUrlConfig();
  const body = { code: pin };
  return httpService.post<T>(urlConfig, body);
};

export default redeemPromoCode;
