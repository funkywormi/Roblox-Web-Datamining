import { navigator } from "@rbx/core-lib/browser";
import { getCurrentUser } from "@rbx/www-common/user";

const isUnauthenticatedSupportedCrawler = (): boolean =>
  !getCurrentUser() && /googlebot|google-inspectiontool/i.test(navigator?.userAgent ?? "");

export default isUnauthenticatedSupportedCrawler;
