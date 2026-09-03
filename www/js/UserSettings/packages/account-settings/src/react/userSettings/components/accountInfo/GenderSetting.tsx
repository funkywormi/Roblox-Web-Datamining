import React, { useEffect } from "react";
import classNames from "classnames";
import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import { useTranslation } from "react-utilities";
import { useSnackbar } from "@rbx/user-settings";
import { TGenderBody } from "../../../../types/accountInformationTypes";
import Gender from "../../../../enums/Gender";
import CollapsibleUserInput from "../../../common/components/CollapsibleUserInput";
import accountInfoTranslationConstants from "../../constants/contentConstants/accountInfoTranslationConstants";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import { useGetGenderQuery, useSetGenderMutation } from "../../../apis/usersApi";

const GenderSetting = (): JSX.Element => {
  const { data: genderBody, status: getGenderStatus } = useGetGenderQuery();
  const [setGender] = useSetGenderMutation();
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  useEffect(() => {
    if (getGenderStatus === QueryStatus.rejected) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  }, [getGenderStatus]);

  const updateGender = async (newGender: Gender) => {
    let updatedGender = newGender;
    if (newGender === genderBody?.gender) {
      updatedGender = Gender.UNKNOWN;
    }
    try {
      const body: TGenderBody = { gender: updatedGender };
      await setGender(body).unwrap();
      snackbarService.success(translate(commonTranslationConstants.successDialogMessage));
    } catch (error) {
      snackbarService.warning(translate(error as string));
    }
  };

  const maleButtonClassNames = classNames("icon-male", {
    selected: genderBody?.gender === Gender.MALE,
  });

  const femaleButtonClassNames = classNames("icon-female", {
    selected: genderBody?.gender === Gender.FEMALE,
  });

  return (
    <CollapsibleUserInput
      mobileLabel={translate(accountInfoTranslationConstants.headings.gender)}
      desktopLabel={translate(accountInfoTranslationConstants.headings.gender)}
      inputId="gender-selector"
    >
      <div className="gender-setting">
        <button
          className="border gender-button"
          onClick={() => updateGender(Gender.MALE)}
          type="button"
        >
          <div className={maleButtonClassNames} />
        </button>
        <button
          className="border gender-button"
          onClick={() => updateGender(Gender.FEMALE)}
          type="button"
        >
          <div className={femaleButtonClassNames} />
        </button>
      </div>
    </CollapsibleUserInput>
  );
};

export default GenderSetting;
