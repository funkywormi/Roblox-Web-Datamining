import React, { useState } from "react";
import { useTranslation } from "react-utilities";
import { Dropdown, Menu, MenuItem, MenuSection } from "@rbx/foundation-ui";
import { useSnackbar } from "@rbx/user-settings";
import SettingsSection from "../../../common/components/SettingsSection";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import { useSettingsInfoModal } from "../../../common/hooks/modals/useSettingsModal";
import { translateDropdownOptions } from "../../../../core/utils/translationUtils";
import accountInfoTranslationConstants from "../../constants/contentConstants/accountInfoTranslationConstants";
import {
  Program,
  NoProgramSelectedValueString,
  NoProgramSelectedLabel,
  EarlyAccessPlaceholder,
} from "../../constants/betaPrograms/betaProgramsConstants";
import { useGetOptInStatusQuery, useOptInToProgramMutation } from "../../../apis/testPilotApi";

interface BetaProgramsSettingsProps {
  betaPrograms?: Program[];
}

export const BetaProgramsSettings = ({
  betaPrograms,
}: BetaProgramsSettingsProps): JSX.Element | null => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [initialProgram, setInitialProgram] = useState<string>("");

  const [statusModalTitle, setStatusModalTitle] = useState(
    commonTranslationConstants.modal.error.title,
  );
  const [statusModalBody, setStatusModalBody] = useState(
    commonTranslationConstants.modal.error.body,
  );
  const [statusModal, statusModalService] = useSettingsInfoModal(statusModalTitle, statusModalBody);

  const passthroughTranslate = (x: string) => x;

  const { data: optIn, isLoading: optInLoading } = useGetOptInStatusQuery();
  const [optInToProgram] = useOptInToProgramMutation();

  if (!optInLoading && optIn && initialProgram === "") {
    setInitialProgram(optIn.programId);
    setSelectedProgram(optIn.programId ?? "");
  }

  /*
  Radix dropdown makes it so that the empty string (which was used for the No Program Selected value)
  is used for an empty selection and showing the placeholder. The constant is defined as -1 in order
  to allow a selectable option for not enrolling in any beta programs.
  */
  const betaProgramOptions = translateDropdownOptions(passthroughTranslate, [
    {
      key: NoProgramSelectedValueString,
      label: NoProgramSelectedLabel,
      value: NoProgramSelectedValueString,
    },
    ...(betaPrograms || []).map(program => ({
      key: program.id,
      label: program.displayName,
      value: program.id,
    })),
  ]);

  const handleChange = async (selectedValue: string) => {
    const newProgramId = selectedValue === NoProgramSelectedValueString ? "" : selectedValue;

    if (newProgramId === selectedProgram) {
      return;
    }

    try {
      await optInToProgram(newProgramId);
      setSelectedProgram(newProgramId);
      snackbarService.success(translate(commonTranslationConstants.successDialogMessage));
    } catch (err) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
      setStatusModalTitle(commonTranslationConstants.modal.error.title);
      setStatusModalBody((err as Error).message);
      statusModalService.open();
    }
  };

  return (
    <React.Fragment>
      <SettingsSection
        title={translate(accountInfoTranslationConstants.headings.earlyAccessPrograms)}
        description={translate(accountInfoTranslationConstants.earlyAccess.description)}
      >
        <div className="beta-programs-settings-container">
          <Dropdown
            value={selectedProgram === "" ? NoProgramSelectedValueString : selectedProgram}
            className="form-group"
            onValueChange={handleChange}
            size="Medium"
            placeholder={EarlyAccessPlaceholder}
          >
            <Menu>
              <MenuSection>
                {betaProgramOptions.map(({ label, value }) => (
                  <MenuItem key={value as string} title={label} value={value as string} />
                ))}
              </MenuSection>
            </Menu>
          </Dropdown>
        </div>
      </SettingsSection>
      {statusModal}
    </React.Fragment>
  );
};

export default BetaProgramsSettings;
