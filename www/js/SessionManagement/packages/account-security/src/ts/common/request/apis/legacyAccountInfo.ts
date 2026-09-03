import { httpService } from "core-utilities";
import { toResult } from "../common";
import {
  LegacyAccountInfoError,
  LegacyAccountInfoResponse,
  LegacyAccountInfoUrlConfig,
} from "../types/legacyAccountInfo";
import { Result } from "../../result";

export const getAccountInfo = (): Promise<
  Result<LegacyAccountInfoResponse, LegacyAccountInfoError | null>
> => toResult(httpService.get(LegacyAccountInfoUrlConfig), LegacyAccountInfoError);
