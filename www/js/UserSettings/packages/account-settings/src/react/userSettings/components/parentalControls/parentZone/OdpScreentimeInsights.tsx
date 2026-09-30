import { authenticatedUser } from "header-scripts";
import { useTranslation } from "react-utilities";
import PreviewCard from "../../../../common/components/routing/PreviewCard";
import ScreentimeChart from "../shared/ScreentimeChart";
import { parentZonePages } from "../../../constants/parentalControls/parentZonePages";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";

// Screen time insights for on-device parent zone
export const OdpScreentimeInsights = (): JSX.Element => {
  const { translate } = useTranslation();

  return (
    <PreviewCard
      title={translate(parentalControlsTranslationConstants.parentalControlsScreentime.heading)}
      linkText={translate(parentalControlsTranslationConstants.parentalControlsScreentime.manage)}
      linkPath={parentZonePages.screentimeManagementPage.path}
    >
      {/* An on-device parent is signed in on the child's account, so this reads the current user. */}
      <ScreentimeChart userId={authenticatedUser.id!} />
    </PreviewCard>
  );
};

export default OdpScreentimeInsights;
