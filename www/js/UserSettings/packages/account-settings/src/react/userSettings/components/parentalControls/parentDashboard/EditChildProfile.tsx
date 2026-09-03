import React from "react";
import { useTranslation } from "react-utilities";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import UnlinkChildButton from "./UnlinkChildButton";
import SettingsSection from "../../../../common/components/SettingsSection";
import ChildBirthday from "./ChildBirthday";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { editChildProfileHelpPageUrl } from "../../../constants/urlConstants";
import ChildAgeGroup from "./ChildAgeGroup";

const EditChildProfile = ({
  child,
  handleUnlinkChild,
}: {
  child: TChildInfo;
  handleUnlinkChild: (childUserId: number) => void;
}): JSX.Element => {
  const { translate } = useTranslation();
  const description = (
    <span
      className="text"
      dangerouslySetInnerHTML={{
        __html: translate(parentalControlsTranslationConstants.childProfileDescription, {
          linkStart: `<a class="text-link" target="_blank" rel="noreferrer" href="${editChildProfileHelpPageUrl}">`,
          linkEnd: "</a>",
        }),
      }}
    />
  );
  return (
    <div className="edit-child-profile-container">
      <div className="child-profile-description">{description}</div>
      <SettingsSection>
        <React.Fragment>
          <ChildBirthday child={child} />
          <ChildAgeGroup child={child} />
        </React.Fragment>
      </SettingsSection>
      <div className="bottom-centered-button">
        <UnlinkChildButton child={child} handleUnlinkChild={handleUnlinkChild} />
      </div>
    </div>
  );
};

export default EditChildProfile;
