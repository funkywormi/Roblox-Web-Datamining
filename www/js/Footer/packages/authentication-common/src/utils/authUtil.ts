import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import { getRefreshSessionUrl } from "../constants/urlConstants";

export const refreshCurrentSession: () => Promise<void> = async () => {
  await httpService.post(
    {
      url: getRefreshSessionUrl(),
      withCredentials: true,
    },
    {},
  );
};
