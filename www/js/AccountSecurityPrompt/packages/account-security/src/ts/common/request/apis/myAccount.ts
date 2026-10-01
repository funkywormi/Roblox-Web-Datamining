import * as http from "@rbx/core-scripts/http";
import { Result } from "../../result";
import { toResult } from "../common";
import * as MyAccount from "../types/myAccount";

export const getMySettingsInfo = (): Promise<
  Result<MyAccount.GetMySettingsInfoReturnType, MyAccount.GetMySettingsInfoError | null>
> =>
  toResult(http.get(MyAccount.GET_MY_SETTINGS_INFO_CONFIG, {}), MyAccount.GetMySettingsInfoError);
