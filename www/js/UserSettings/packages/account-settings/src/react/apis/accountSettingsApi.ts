import { accountCountrySetting, emailsUrl } from "../userSettings/constants/urlConstants";
import baseApi from "./common/baseApi";
import ApiCacheTag from "./common/cacheTagEnum";
import { TBaseQueryArgs } from "./common/httpServiceBaseQueryFn";
import { TAccountCountryBody, TEmailsBody } from "../../types/accountInformationTypes";

export const accountSettingsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Account Country
    getAccountCountry: builder.query<TAccountCountryBody, void>({
      query: (): TBaseQueryArgs => ({ url: accountCountrySetting }),
      providesTags: [ApiCacheTag.AccountCountry],
    }),
    // Emails
    getEmails: builder.query<TEmailsBody, void>({
      query: (): TBaseQueryArgs => ({ url: emailsUrl }),
      providesTags: [ApiCacheTag.AccountInfo],
    }),
  }),
});

export const { useGetAccountCountryQuery, useGetEmailsQuery } = accountSettingsApi;
