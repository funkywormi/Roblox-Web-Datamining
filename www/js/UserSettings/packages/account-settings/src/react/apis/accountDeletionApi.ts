import baseApi from "./common/baseApi";
import { accountDeactivationEndpoint } from "../userSettings/constants/urlConstants";
import { TBaseQueryArgs } from "./common/httpServiceBaseQueryFn";

export const accountDeletionApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    deactivateUser: builder.mutation<void, void>({
      query: (): TBaseQueryArgs => {
        return {
          url: accountDeactivationEndpoint,
        };
      },
    }),
  }),
});

export const { useDeactivateUserMutation } = accountDeletionApi;
