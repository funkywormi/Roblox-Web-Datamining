import React, { useMemo } from "react";
import { useTranslation } from "react-utilities";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import SettingsTextField from "../../../../common/components/SettingsTextField";
import useChangeChildBirthdateModal from "../../../../common/hooks/modals/useChangeChildBirthdateModal";
import accountInfoTranslationConstants from "../../../constants/contentConstants/accountInfoTranslationConstants";
import birthdayUtils from "../../../utils/birthdayUtils";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import { minimumValidAge } from "../../../constants/accountInfo/accountInfoConstants";
import { birthdateUpdateHelpArticle } from "../../../constants/urlConstants";
import SettingListItem from "../../../../common/components/routing/SettingListItem";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";

const { birthdate: birthdateTranslation } = accountInfoTranslationConstants;

export const ChildBirthday = ({ child }: { child: TChildInfo }): JSX.Element => {
  const { translate } = useTranslation();
  const { birthDate } = child;
  const [changeAgeModal, changeAgeModalService] = useChangeChildBirthdateModal(child);

  const changeBirthday = () => {
    changeAgeModalService.open();
  };

  const invalidBirthdateMetadata = useMemo(() => {
    const age = birthdayUtils.calculateAgeFromISO(birthDate);
    if (age < minimumValidAge) {
      return (
        <span className="account-field-email-verify-msg text-error" data-testid="u5-message">
          {translate(birthdateTranslation.updateChildBirthdayMessage)}
          &nbsp;
          <a
            className="text-link"
            href={birthdateUpdateHelpArticle}
            target="_blank"
            rel="noreferrer"
          >
            {translate(commonTranslationConstants.learnMore)}
          </a>
        </span>
      );
    }
    return null;
  }, [birthDate]);

  if (invalidBirthdateMetadata !== null) {
    return (
      <React.Fragment>
        <div className="child-birthday-container">
          <SettingsTextField
            id="child-birthday"
            primaryEditLabel={translate(parentalControlsTranslationConstants.changeChildBirthday)}
            label={translate(birthdateTranslation.label)}
            valueSet
            lines={[
              {
                value: birthDate ? birthdayUtils.formatBirthdateFromISO(birthDate) : "",
                metadataBody: invalidBirthdateMetadata,
              },
            ]}
            primaryOnEdit={changeBirthday}
          />
        </div>
        <div className="rbx-divider child-profile-divider" />
        {changeAgeModal}
      </React.Fragment>
    );
  }

  let descriptionWithLink;
  if (child.isChildIdvAgeAssured) {
    descriptionWithLink = (
      <span
        className="small text"
        dangerouslySetInnerHTML={{
          __html: translate(
            parentalControlsTranslationConstants.childInlineBirthdayIdvDescription,
            {
              linkStart: `<a class="text-link" target="_blank" rel="noreferrer" href="${birthdateUpdateHelpArticle}">`,
              linkEnd: "</a>",
            },
          ),
        }}
      />
    );
  } else if (child.hasParentVerifiedChildBirthdate) {
    descriptionWithLink = (
      <span
        className="small text"
        dangerouslySetInnerHTML={{
          __html: translate(
            parentalControlsTranslationConstants.childInlineBirthdayVpcDescription,
            {
              linkStart: `<a class="text-link" target="_blank" rel="noreferrer" href="${birthdateUpdateHelpArticle}">`,
              linkEnd: "</a>",
            },
          ),
        }}
      />
    );
  }

  return (
    <React.Fragment>
      <span
        role="button"
        tabIndex={child.canParentUpdateChildBirthdate ? 0 : -1}
        onClick={child.canParentUpdateChildBirthdate ? changeBirthday : undefined}
        onKeyPress={child.canParentUpdateChildBirthdate ? changeBirthday : undefined}
        aria-disabled={!child.canParentUpdateChildBirthdate}
        data-testid="change-child-birthday-button"
      >
        <div className="child-birthday-container">
          <SettingListItem
            title={translate(birthdateTranslation.label)}
            descriptionWithLink={descriptionWithLink}
            currentSettingValueComponent={
              <span>{birthdayUtils.formatBirthdateFromISO(birthDate)}</span>
            }
            showArrow={child.canParentUpdateChildBirthdate}
          />
        </div>
      </span>
      <div className="rbx-divider child-profile-divider" />
      {changeAgeModal}
    </React.Fragment>
  );
};

export default ChildBirthday;
