import { Link } from "@rbx/core-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { isLoginLinkAvailable, getLoginLinkUrl } from "../util/authUtil";

export default function HeaderLoginLink() {
  const { translate } = useTranslation();
  return (
    <li className="login-action">
      {isLoginLinkAvailable() && (
        <Link
          url={getLoginLinkUrl()}
          className="rbx-navbar-login btn-secondary-sm nav-menu-title rbx-menu-item"
        >
          {translate("Label.sLogin")}
        </Link>
      )}
    </li>
  );
}
