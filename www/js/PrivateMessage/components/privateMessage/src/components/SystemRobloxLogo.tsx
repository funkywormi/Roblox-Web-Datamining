import classNames from "classnames";
import { assetUrl } from "@rbx/www-common/asset";
import robloxLogoDark from "../images/logos/logo_O_dark_08292022.svg";
import robloxLogoLight from "../images/logos/logo_O_light_08292022.svg";

const SystemRobloxLogo = ({ className }: { className?: string }): React.ReactElement => (
  <span aria-hidden="true" className={classNames("flex items-center justify-center", className)}>
    <img
      alt=""
      src={assetUrl(robloxLogoLight)}
      className="dark:hidden"
      style={{ width: "100%", height: "100%" }}
    />
    <img
      alt=""
      src={assetUrl(robloxLogoDark)}
      className="hidden dark:block"
      style={{ width: "100%", height: "100%" }}
    />
  </span>
);

export default SystemRobloxLogo;
