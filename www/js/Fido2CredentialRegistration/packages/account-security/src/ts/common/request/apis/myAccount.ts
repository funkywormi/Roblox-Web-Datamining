import transport from "../requestTransport";
import { Result } from "../../result";
import { toResult } from "../common";
import * as MyAccount from "../types/myAccount";

export const getMySettingsInfo = (): Promise<
  Result<MyAccount.GetMySettingsInfoReturnType, MyAccount.GetMySettingsInfoError | null>
> =>
  toResult(
    transport.get(MyAccount.GET_MY_SETTINGS_INFO_CONFIG, {}),
    MyAccount.GetMySettingsInfoError,
  );
