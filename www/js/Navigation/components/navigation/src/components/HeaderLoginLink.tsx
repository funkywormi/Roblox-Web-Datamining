import { useTranslations } from "@rbx/www-common/i18n";
import { isLoginLinkAvailable, getLoginLinkUrl } from "../util/authLinkUtil";
import { useNavLocation } from "../util/navLocation";
import Link from "./NavLink";

export default function HeaderLoginLink() {
  const t = useTranslations("CommonUI.Features");
  const location = useNavLocation();
  const loginLink = isLoginLinkAvailable(location) ? getLoginLinkUrl(location) : null;
  return (
    <li className="login-action">
      {loginLink != null && (
        <Link
          url={loginLink}
          className="rbx-navbar-login btn-secondary-sm nav-menu-title rbx-menu-item"
        >
          {t("Label.sLogin")}
        </Link>
      )}
    </li>
  );
}
