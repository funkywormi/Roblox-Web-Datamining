import transport from "../requestTransport";
import { toResult } from "../common";
import {
  LegacyAccountInfoError,
  LegacyAccountInfoResponse,
  LegacyAccountInfoUrlConfig,
} from "../types/legacyAccountInfo";
import { Result } from "../../result";

export const getAccountInfo = (): Promise<
  Result<LegacyAccountInfoResponse, LegacyAccountInfoError | null>
> => toResult(transport.get(LegacyAccountInfoUrlConfig), LegacyAccountInfoError);
