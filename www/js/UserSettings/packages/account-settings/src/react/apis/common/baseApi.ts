import { createApi } from "@reduxjs/toolkit/query/react";
import ApiCacheTag from "./cacheTagEnum";
import { httpBaseQueryFn } from "./httpServiceBaseQueryFn";

const reducerPath = "baseApiSlice";

/**
 * Serves as the baseApi for all API endpoints used within Account Settings
 * webapp. All endpoint definitions can be injected into the baseApi e.g:
 *
 * import baseApi from './baseApi'
 *
 * const accountInfoApi = baseApi.injectEndpoints({
 *  endpoints: builder => ({
 *    getAccountInfo: builder.query({
 *      ...
 *    }),
 *  }),
 * })
 *
 * export default accountInfoApi;
 */
const baseApi = createApi({
  tagTypes: Object.keys(ApiCacheTag),
  reducerPath,
  baseQuery: httpBaseQueryFn,
  endpoints: () => ({}),
});

export default baseApi;
