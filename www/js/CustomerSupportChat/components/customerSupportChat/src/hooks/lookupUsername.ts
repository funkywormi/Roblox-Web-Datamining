import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import { apiSet } from "../core/constants/services";
import { UsernameValidationResponse } from "../core/types/supportTicket";

const lookupUsername: (username: string) => Promise<UsernameValidationResponse> = async (
  username: string,
) => {
  const { data } = await httpService.get<UsernameValidationResponse>(
    {
      url: apiSet.validateUsername.url,
      params: { username },
    },
    {
      username,
    },
  );
  return data;
};

export default lookupUsername;
