import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import LeftNavigationOld from "./old";
import LeftNavigationNew from "./new";
import { isAccountExperienceRevampEnabled } from "../util/accountExperienceUtils";
import { useNewLeftNav } from "./newLeftNav";

export default function LeftNavigation() {
  const newLeftNav = useNewLeftNav();
  const user = authenticatedUser();
  if (!user?.isAuthenticated || isAccountExperienceRevampEnabled()) {
    return null;
  }

  return newLeftNav ? <LeftNavigationNew user={user} /> : <LeftNavigationOld />;
}
