import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { getCurrentUser } from "@rbx/www-common/user";
import ExperimentationService from "@rbx/experimentation";
import { trackCounter } from "../observability";
import { getIosMajorVersion } from "../utils/iosVersion";

export const DEFAULT_LOGIN_REDIRECT_PATHNAME = "/login-redirect";
export const NEXTJS_LOGIN_REDIRECT_PATHNAME = "/login-redirect/v2";
export const LOGIN_REDIRECT_PATHNAME_LAYER = "Payments.LoginRedirect.ExposureBased";
export const MIN_SUPPORTED_IOS_MAJOR_VERSION = 18;
const ExperimentParameterName = "variant";

export class LoginRedirectService {
  private isExperimentAccessed = false;

  async getExperimentBasedPathname(): Promise<{ pathname: string; isInExperiment: boolean }> {
    const userId = getCurrentUser()?.id;
    if (!userId) {
      return { pathname: DEFAULT_LOGIN_REDIRECT_PATHNAME, isInExperiment: false };
    }

    const deviceMeta = getDeviceMeta();
    const appType = (deviceMeta?.appType ?? "unknown").trim().replace(/\s+/g, "_");

    // Bail before touching the layer so these users are never assigned or exposed.
    const iosMajorVersion = getIosMajorVersion();
    if (iosMajorVersion !== null && iosMajorVersion < MIN_SUPPORTED_IOS_MAJOR_VERSION) {
      trackCounter("LoginRedirectUnsupportedIos", {
        iosMajorVersion: iosMajorVersion.toString(),
        appType,
      });
      return { pathname: DEFAULT_LOGIN_REDIRECT_PATHNAME, isInExperiment: false };
    }

    const res = await ExperimentationService.getAllValuesForLayer(LOGIN_REDIRECT_PATHNAME_LAYER);
    const variant = res[ExperimentParameterName];
    if (typeof variant === "number") {
      this.isExperimentAccessed = true;
      trackCounter("LoginRedirectExperimentEvaluated", {
        variant: variant.toString(),
        appType,
      });
      return {
        pathname: variant === 1 ? NEXTJS_LOGIN_REDIRECT_PATHNAME : DEFAULT_LOGIN_REDIRECT_PATHNAME,
        isInExperiment: true,
      };
    }

    trackCounter("LoginRedirectExperimentEvaluated", { variant: "unknown", appType });
    return { pathname: DEFAULT_LOGIN_REDIRECT_PATHNAME, isInExperiment: false };
  }

  logLayerExposure() {
    if (!this.isExperimentAccessed) {
      trackCounter("LoginRedirectLoggingExposureWithoutExperimentAccess");
      return;
    }
    trackCounter("LoginRedirectExperimentExposed");
    ExperimentationService.logLayerExposure(LOGIN_REDIRECT_PATHNAME_LAYER);
  }
}

export const loginRedirectService = new LoginRedirectService();
