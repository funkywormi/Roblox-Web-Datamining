import { EnvironmentUrls } from '@rbx/legacy-webapp-types/Roblox';
import { urlService } from '@rbx/core-scripts/legacy/core-utilities';

export const LoginUrlService = {
  getLoginUrl: (): string => {
    const returnPath = encodeURIComponent(window.location.pathname + window.location.search);
    return urlService.getAbsoluteUrl(`/newlogin?returnurl=${returnPath}`);
  }
};

export default LoginUrlService;
