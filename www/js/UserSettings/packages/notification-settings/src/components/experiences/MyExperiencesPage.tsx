import { Fragment, JSX } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { ProgressCircle } from "@rbx/foundation-ui";
import { BackLink } from "../BackLink";
import translationConstants from "../../constants/translationConstants";
import { useMyExperiencesData } from "../../hooks/useMyExperiencesData";
import { ROUTES } from "../../utils/routingUtils";
import { ExperienceNotificationsListItem } from "./ExperienceNotificationsListItem";

export const MyExperiencesPage = (): JSX.Element => {
  const { translate } = useTranslation();
  const { preferences, rows, loading, error, setExperienceEnabled } = useMyExperiencesData();

  const notificationCenterSubtitle = translate(translationConstants.notificationCenterLabel);

  const renderContent = (): JSX.Element => {
    if (loading) {
      return <ProgressCircle ariaLabel="Loading" size="Medium" variant="Indeterminate" />;
    }
    if (error) {
      return (
        <p className="text-body-medium">
          {translate(translationConstants.errorLoadingExperiences)}
        </p>
      );
    }
    if (preferences?.parentalControlsEnabled) {
      return (
        <p className="text-body-medium">
          {translate(translationConstants.parentDisabledGameNotifications)}
        </p>
      );
    }
    if (rows.length === 0) {
      return <p className="text-body-medium">{translate(translationConstants.noExperiences)}</p>;
    }
    return (
      <Fragment>
        <p className="text-body-medium">
          {translate(translationConstants.myExperiencesDescription)}
        </p>
        <div className="experience-notifications-list">
          {rows.map(row => (
            <ExperienceNotificationsListItem
              key={row.universeId}
              row={row}
              description={notificationCenterSubtitle}
              onToggled={setExperienceEnabled}
            />
          ))}
        </div>
      </Fragment>
    );
  };

  return (
    <div className="my-experiences-page">
      <BackLink
        currentPagePath={ROUTES.myExperiences}
        titleTranslationKey={translationConstants.myExperiences}
      />
      {renderContent()}
    </div>
  );
};

export default MyExperiencesPage;
