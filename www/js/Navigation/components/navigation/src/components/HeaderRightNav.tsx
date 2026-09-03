import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import HeaderIconsGroup from "../containers/HeaderIconsGroup";
import UniverseSearchIcon from "./UniverseSearchIcon";
import HeaderSignupLink from "./HeaderSignupLink";
import HeaderLoginLink from "./HeaderLoginLink";

export default function HeaderRightNav({
  toggleUniverseSearch,
}: {
  toggleUniverseSearch: () => void;
}) {
  const user = authenticatedUser();
  if (user != null) {
    return (
      <div className="navbar-right rbx-navbar-right">
        <HeaderIconsGroup toggleUniverseSearch={toggleUniverseSearch} />
      </div>
    );
  }

  return (
    <div className="navbar-right rbx-navbar-right">
      <ul className="nav navbar-right rbx-navbar-right-nav">
        <HeaderSignupLink />
        <HeaderLoginLink />
        <UniverseSearchIcon toggleUniverseSearch={toggleUniverseSearch} />
      </ul>
    </div>
  );
}
