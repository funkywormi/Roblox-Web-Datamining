import React from "react";
import { useExperiments } from "@rbx/profile-common/ExperimentsContext";
import { ExperimentKey } from "@rbx/profile-common/experimentationUtils";
import UserProfileAssociatedItemsRow from "./UserProfileAssociatedItemsRow";
import ProfileHeaderDetails from "./ProfileHeaderDetails";
import AboutContainer from "./About/AboutContainer";
import ProfileHeaderButtons from "./ProfileHeaderButtons";
import ProfileHeaderContextualMenu from "./ProfileHeaderContextualMenu";
import CurrentlyPlayingCard from "./CurrentlyPlayingCard";
import { useIsTrustedFriendsOnWebLoaded } from "./useIsTrustedFriendsOnWebEnabled";
import { useActionMap } from "../hooks/actions/useActionMap";
import { useProfilePlatformContext } from "../context/ProfilePlatformContext";

interface UserProfileHeaderProps {
  gracefulDegradationEnabled: boolean;
}

const UserProfileHeader = ({ gracefulDegradationEnabled }: UserProfileHeaderProps) => {
  const styleClass = "profile-header-overlay";
  const actionMap = useActionMap();
  const { isInTreatment } = useExperiments();
  const { isActionsLoaded } = useProfilePlatformContext();
  // Hide actions until both the experiment-dependent Actions and the trusted friends rollout
  // check have settled; otherwise the control variant or hidden trusted friend buttons flash in.
  const isTrustedFriendsOnWebLoaded = useIsTrustedFriendsOnWebLoaded();
  const showActions = isActionsLoaded && isTrustedFriendsOnWebLoaded;
  const isIARCProfileRedesignEnabled = isInTreatment(ExperimentKey.IsIARCProfileRedesignEnabled);
  const actionComponents: React.ReactNode[] = [];
  for (const [key, config] of Object.entries(actionMap)) {
    if (config.Component) {
      actionComponents.push(<React.Fragment key={key}>{config.Component()}</React.Fragment>);
    }
  }

  return (
    <div className={styleClass}>
      <div id="user-profile-header-bg">
        <div className="user-profile-header flex flex-col gap-large">
          <div className="user-profile-header-info flex justify-between items-center">
            <ProfileHeaderDetails />
            <div className="flex flex-col gap-small buttons-show-on-desktop">
              {isIARCProfileRedesignEnabled && <CurrentlyPlayingCard />}
              {showActions && (
                <div className="flex gap-small">
                  <ProfileHeaderButtons actionMap={actionMap} />
                  <ProfileHeaderContextualMenu actionMap={actionMap} />
                </div>
              )}
            </div>
          </div>
          <UserProfileAssociatedItemsRow />
          {!gracefulDegradationEnabled && <AboutContainer />}
          <div className="flex flex-col gap-small buttons-show-on-mobile">
            {isIARCProfileRedesignEnabled && <CurrentlyPlayingCard />}
            {showActions && (
              <div className="flex gap-small">
                <ProfileHeaderButtons actionMap={actionMap} />
                <ProfileHeaderContextualMenu actionMap={actionMap} />
              </div>
            )}
          </div>
        </div>
      </div>
      {actionComponents.length > 0 && actionComponents}
    </div>
  );
};

export default UserProfileHeader;
