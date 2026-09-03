import { QueryReturnValue } from "@reduxjs/toolkit/dist/query/baseQueryTypes";
import { TRobuxTransferMap, TGetTransferResponse } from "../../types/robuxTransferTypes";
import { getRobuxTransferEndpointUrl } from "../userSettings/constants/urlConstants";
import baseApi from "./common/baseApi";

export const robuxTransferApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getTransferRequestsByIds: builder.query<TRobuxTransferMap, number[]>({
      queryFn: async (transferRequestIds: number[], _queryApi, _extraOptions, baseQuery) => {
        const publicTransferIds = transferRequestIds.map(item => `RXT-${item}`);
        const queryResult = await Promise.all(
          publicTransferIds.map(
            id =>
              baseQuery({
                url: getRobuxTransferEndpointUrl(id),
                retryable: true,
              }) as Promise<QueryReturnValue<TGetTransferResponse>>,
          ),
        );

        const transferMap: TRobuxTransferMap = {};
        transferRequestIds.forEach((transferRequestId, index) => {
          const result = queryResult[index];
          if (result?.data?.transfer) {
            transferMap[transferRequestId] = result.data.transfer;
          }
        });

        return { data: transferMap };
      },
    }),
  }),
});

export const { useGetTransferRequestsByIdsQuery } = robuxTransferApi;
