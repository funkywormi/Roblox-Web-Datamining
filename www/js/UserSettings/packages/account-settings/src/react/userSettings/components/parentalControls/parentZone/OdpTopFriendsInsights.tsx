import { authenticatedUser } from "header-scripts";
import FriendsPreviewCard from "../shared/FriendsPreviewCard";
import { parentZonePages } from "../../../constants/parentalControls/parentZonePages";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { useWrappedTranslation } from "../../../hooks/useWrappedTranslation";
import { btnClickOdpTopFriends } from "../../../services/eventServices/odpFamilyEventService";
import { useGetParentInfoQuery } from "../../../../apis/parentalControlsApi";

export const OdpTopFriendsInsights = (): JSX.Element => {
  const { translate } = useWrappedTranslation();
  const { data: parentInfo } = useGetParentInfoQuery();

  return (
    <FriendsPreviewCard
      userId={authenticatedUser.id!}
      linkText={translate(parentalControlsTranslationConstants.friendManagement.more)}
      linkPath={parentZonePages.friendManagementPage.path}
      onLinkClick={() => btnClickOdpTopFriends(parentInfo?.parents)}
    />
  );
};

export default OdpTopFriendsInsights;
