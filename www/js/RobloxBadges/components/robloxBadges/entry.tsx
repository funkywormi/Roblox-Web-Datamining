import { addExternal } from "@rbx/externals";
import {
  BadgeSizes,
  currentUserHasVerifiedBadge,
  initRobloxBadgesFrameworkAgnostic,
  VerifiedBadgeIconContainer,
  VerifiedBadgeStringContainer,
  fetchTranslations,
} from "./src";

addExternal("RobloxBadges", {
  BadgeSizes,
  initRobloxBadgesFrameworkAgnostic,
  VerifiedBadgeStringContainer,
  VerifiedBadgeIconContainer,
  currentUserHasVerifiedBadge,
  fetchTranslations,
});
