import { EnvironmentUrls } from "@rbx/environment-urls";
import { httpService } from "@rbx/core-scripts/legacy/core-utilities";

const logoutService = {
  logout: (): Promise<unknown> => {
    const urlConfig = { url: `${EnvironmentUrls.authApi}/v2/logout`, withCredentials: true };
    return httpService
      .post(urlConfig)
      .then(() => {
        window.location.reload();
      })
      .catch((error: unknown) => {
        throw error;
      });
  },
};

export default logoutService;
