import { httpService } from "core-utilities";
import { TBaseQueryArgs } from "./common/httpServiceBaseQueryFn";
import {
  accountInformationPhoneEndpoint,
  promotionChannelsEndpoint,
} from "../userSettings/constants/urlConstants";
import { TPhoneResponse, TPromotionChannelsBody } from "../../types/accountInformationTypes";
import ApiCacheTag from "./common/cacheTagEnum";
import baseApi from "./common/baseApi";
import { PromotionChannelsErrorCode } from "../../enums/errorCodes";
import commonTranslationConstants from "../userSettings/constants/contentConstants/commonTranslationConstants";
import { promotionChannelsErrorCodeToStringKeys } from "../userSettings/constants/errorCodeToStringKeyMappings";

export const accountInformationApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getPromotionChannels: builder.query<TPromotionChannelsBody, void>({
      query: (): TBaseQueryArgs => ({ url: promotionChannelsEndpoint }),
      // We don't provide an Api Cache Tag here, because we don't want user input to be cleared if an error occurs
    }),
    updatePromotionChannels: builder.mutation<Promise<unknown>, TPromotionChannelsBody>({
      query: (promotionChannelsBody: TPromotionChannelsBody): TBaseQueryArgs => {
        return {
          url: promotionChannelsEndpoint,
          postBody: promotionChannelsBody,
        };
      },
      transformErrorResponse: (err: unknown): string => {
        const errorCode = httpService.parseErrorCode(err) as PromotionChannelsErrorCode;
        return (
          promotionChannelsErrorCodeToStringKeys[errorCode] ||
          commonTranslationConstants.unknownError
        );
      },
    }),
    getPhone: builder.query<TPhoneResponse, void>({
      query: (): TBaseQueryArgs => ({ url: accountInformationPhoneEndpoint }),
      providesTags: [ApiCacheTag.Phone],
    }),
  }),
});

export const {
  useGetPromotionChannelsQuery,
  useUpdatePromotionChannelsMutation,
  useGetPhoneQuery,
} = accountInformationApi;
