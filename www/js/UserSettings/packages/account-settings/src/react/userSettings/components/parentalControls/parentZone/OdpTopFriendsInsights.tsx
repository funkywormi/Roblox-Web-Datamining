import { authenticatedUser } from "header-scripts";
import FriendsPreviewCard from "../shared/FriendsPreviewCard";
import { parentZonePages } from "../../../constants/parentalControls/parentZonePages";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { useWrappedTranslation } from "../../../hooks/useWrappedTranslation";

export const OdpTopFriendsInsights = (): JSX.Element => {
  const { translate } = useWrappedTranslation();

  return (
    <FriendsPreviewCard
      userId={authenticatedUser.id!}
      linkText={translate(parentalControlsTranslationConstants.friendManagement.more)}
      linkPath={parentZonePages.friendManagementPage.path}
    />
  );
};

export default OdpTopFriendsInsights;
