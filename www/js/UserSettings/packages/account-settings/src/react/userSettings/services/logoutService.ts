import { EnvironmentUrls } from "Roblox";
import { httpService } from "core-utilities";
import reloadUtils from "../utils/reloadUtils";

const logoutService = {
  logout: (): Promise<unknown> => {
    const urlConfig = { url: `${EnvironmentUrls.authApi}/v2/logout`, withCredentials: true };
    return httpService
      .post(urlConfig)
      .then(() => {
        reloadUtils.reloadPage();
      })
      .catch(error => {
        throw error;
      });
  },
};

export default logoutService;
