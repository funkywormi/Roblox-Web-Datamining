import { TBaseQueryArgs } from "./common/httpServiceBaseQueryFn";
import baseApi from "./common/baseApi";
import {
  getAMPFeatureUrl,
  getAMPFeatureUrlWithNamespace,
} from "../userSettings/constants/urlConstants";
import { AmpResponse } from "../../types/accessManagementTypes";

interface GetFeatureAccessArgs {
  featureName: string; // should be one of AMPFeaturesConstants.ts
  namespace?: string; // should be one of the Namespaces in AMPFeaturesConstants.ts
}

export const accessManagementApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getFeatureAccess: builder.query<AmpResponse, GetFeatureAccessArgs>({
      query: ({ featureName, namespace }): TBaseQueryArgs => ({
        url: namespace
          ? getAMPFeatureUrlWithNamespace(featureName, namespace)
          : getAMPFeatureUrl(featureName),
      }),
    }),
  }),
});

export const { useGetFeatureAccessQuery } = accessManagementApi;
