import baseApi from "./common/baseApi";
import ApiCacheTag from "./common/cacheTagEnum";
import { accountInfoEndpoint } from "../userSettings/constants/urlConstants";
import { TBaseQueryArgs } from "./common/httpServiceBaseQueryFn";
import { TAccountInfoBody } from "../../types/accountInformationTypes";

// These are legacy account settings service from website controllers, etc
// These services need to be migrated to a new home eventually
const legacyAccountSettingsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getAccountInfo: builder.query<TAccountInfoBody, void>({
      query: (): TBaseQueryArgs => ({ url: accountInfoEndpoint }),
      providesTags: [ApiCacheTag.AccountInfo],
    }),
  }),
});

export const { useGetAccountInfoQuery } = legacyAccountSettingsApi;

export default legacyAccountSettingsApi;
