import baseApi from "./common/baseApi";
import { TBaseQueryArgs } from "./common/httpServiceBaseQueryFn";
import {
  getUserLocalizationLocusEndpoint,
  setShowRobloxTranslationsEndpoint,
} from "../userSettings/constants/urlConstants";
import {
  TSetShowRobloxTranslationsRequest,
  TUserLocalizationLocusResponse,
} from "../../types/localeTypes";
import ApiCacheTag from "./common/cacheTagEnum";

export const localeApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getUserLocalizationLocus: builder.query<TUserLocalizationLocusResponse, void>({
      query: (): TBaseQueryArgs => ({ url: getUserLocalizationLocusEndpoint }),
      providesTags: [ApiCacheTag.AccountLocale],
    }),
    setShowRobloxTranslations: builder.mutation<void, TSetShowRobloxTranslationsRequest>({
      query: (showRobloxTranslations: TSetShowRobloxTranslationsRequest): TBaseQueryArgs => ({
        url: setShowRobloxTranslationsEndpoint,
        postBody: showRobloxTranslations,
      }),
      invalidatesTags: [ApiCacheTag.AccountLocale],
    }),
  }),
});

export const { useGetUserLocalizationLocusQuery, useSetShowRobloxTranslationsMutation } = localeApi;
