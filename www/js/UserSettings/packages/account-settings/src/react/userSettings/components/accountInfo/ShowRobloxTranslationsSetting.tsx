import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-utilities";
import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import { Dropdown, Menu, MenuItem, MenuSection } from "@rbx/foundation-ui";
import { useSnackbar } from "@rbx/user-settings";
import CollapsibleUserInput from "../../../common/components/CollapsibleUserInput";
import {
  useGetUserLocalizationLocusQuery,
  useSetShowRobloxTranslationsMutation,
} from "../../../apis/localeApi";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";

import { translateDropdownOptions } from "../../../../core/utils/translationUtils";
import {
  ExperienceTranslationsOptions,
  experienceTranslationMappings,
  experienceTranslationsOptions,
  experienceTranslationsPlaceholder,
} from "../../constants/translations/translationSettingsConstants";
import { translationsMoreInfo } from "../../constants/urlConstants";

export const ShowRobloxTranslationsSetting = (): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const { data: userLocalizationLocus, status: getUserLocalizationLocusStatus } =
    useGetUserLocalizationLocusQuery();
  const [localeApiSetShowRobloxTranslations] = useSetShowRobloxTranslationsMutation();
  useEffect(() => {
    if (getUserLocalizationLocusStatus === QueryStatus.rejected) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  }, [getUserLocalizationLocusStatus, snackbarService, translate]);

  const isShowRobloxTranslationsOn = useMemo(() => {
    return userLocalizationLocus?.showRobloxTranslations ?? false;
  }, [userLocalizationLocus]);

  const updateShowRobloxTranslations = async (newOption: ExperienceTranslationsOptions) => {
    const updatedSetting = experienceTranslationMappings[newOption];
    // only try and update if the new option is different from the current setting
    if (isShowRobloxTranslationsOn !== updatedSetting) {
      try {
        await localeApiSetShowRobloxTranslations({
          showRobloxTranslations: updatedSetting,
        }).unwrap();
        snackbarService.success(translate(commonTranslationConstants.successDialogMessage));
      } catch (error) {
        snackbarService.warning(translate(commonTranslationConstants.unknownError));
      }
    }
  };

  const selectionOptions = useMemo(() => {
    return translateDropdownOptions(translate, experienceTranslationsOptions);
  }, [translate]);

  const description = (
    <span
      className="small text"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: translate("Description.TranslationDisclaimer", {
          linkStart: `<a class="text-link" target="_blank" rel="noreferrer" href="${translationsMoreInfo}">`,
          linkEnd: "</a>",
        }),
      }}
    />
  );

  return (
    <CollapsibleUserInput
      mobileLabel={translate("Title.EnableExperienceTranslations")}
      desktopLabel={translate("Title.EnableExperienceTranslations")}
      inputId="experience-translation-dropdown"
    >
      <Dropdown
        value={
          isShowRobloxTranslationsOn
            ? ExperienceTranslationsOptions.On
            : ExperienceTranslationsOptions.Off
        }
        className="form-group"
        onValueChange={async (selectedValue: string) => {
          await updateShowRobloxTranslations(selectedValue as ExperienceTranslationsOptions);
        }}
        size="Medium"
        placeholder={experienceTranslationsPlaceholder}
      >
        <Menu>
          <MenuSection>
            {selectionOptions.map(({ label, value }) => (
              <MenuItem key={value as string} title={label} value={value as string} />
            ))}
          </MenuSection>
        </Menu>
      </Dropdown>
      {description}
    </CollapsibleUserInput>
  );
};

export default ShowRobloxTranslationsSetting;
