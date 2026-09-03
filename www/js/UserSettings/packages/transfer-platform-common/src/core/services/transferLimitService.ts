import { GetUserTransferLimitResponse } from "@rbx/client-transfer-api/v1";
import { robuxTransferApiClient } from "../clients/transferApiClient";

export const getUserTransferLimit = async (): Promise<GetUserTransferLimitResponse> => {
  return robuxTransferApiClient.robuxTransferGetUserTransferLimit();
};
