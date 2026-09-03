import React from "react";
import { useTranslation } from "react-utilities";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import SettingListItem from "../../../../common/components/routing/SettingListItem";
import accountInfoTranslationConstants from "../../../constants/contentConstants/accountInfoTranslationConstants";

const { ageGroup: ageGroupTranslation } = accountInfoTranslationConstants;

export const ChildAgeGroup = ({ child }: { child: TChildInfo }): JSX.Element | null => {
  const { translate } = useTranslation();
  const { ageGroup, isAgeChecked } = child;

  if (!ageGroup) {
    return null;
  }

  return (
    <React.Fragment>
      <div className="child-age-group-container">
        <SettingListItem
          title={translate(ageGroupTranslation.label)}
          currentSettingValueComponent={<span>{translate(ageGroup)}</span>}
          description={isAgeChecked ? translate(ageGroupTranslation.checkedLabel) : undefined}
          showArrow={false}
        />
      </div>
      <div className="rbx-divider child-profile-divider" />
    </React.Fragment>
  );
};

export default ChildAgeGroup;
