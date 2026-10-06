import { useTranslations } from "@rbx/www-common/i18n";
import { isLoginLinkAvailable, getLoginLinkUrl } from "../util/authUtil";
import Link from "./NavLink";

export default function HeaderLoginLink() {
  const t = useTranslations("CommonUI.Features");
  return (
    <li className="login-action">
      {isLoginLinkAvailable() && (
        <Link
          url={getLoginLinkUrl()}
          className="rbx-navbar-login btn-secondary-sm nav-menu-title rbx-menu-item"
        >
          {t("Label.sLogin")}
        </Link>
      )}
    </li>
  );
}
