import * as http from "@rbx/core-scripts/http";
import { Result } from "../../result";
import { toResult } from "../common";
import * as PrivateAccessToken from "../types/privateAccessToken";

export const getPatToken = async (
  challengeId: string,
): Promise<
  Result<
    PrivateAccessToken.GetPatTokenReturnType,
    PrivateAccessToken.PrivateAccessTokenError | null
  >
> =>
  toResult(
    http.post(PrivateAccessToken.GET_PAT_TOKEN_CONFIG, { challengeId }),
    PrivateAccessToken.PrivateAccessTokenError,
  );
