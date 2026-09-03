import { HttpMethod, TBaseQueryArgs } from "./common/httpServiceBaseQueryFn";
import { contactsEndpoint } from "../userSettings/constants/urlConstants";
import baseApi from "./common/baseApi";

import { TContactsBody } from "../../types/contactsTypes";
import ApiCacheTag from "./common/cacheTagEnum";

const contactsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getContacts: builder.query<TContactsBody, void>({
      query: (): TBaseQueryArgs => ({
        url: contactsEndpoint,
      }),
      providesTags: [ApiCacheTag.Contacts],
    }),
    deleteContacts: builder.mutation<void, void>({
      query: (): TBaseQueryArgs => ({
        method: HttpMethod.DELETE,
        url: contactsEndpoint,
      }),
      invalidatesTags: [ApiCacheTag.Contacts],
    }),
  }),
});

export const { useGetContactsQuery, useDeleteContactsMutation } = contactsApi;
