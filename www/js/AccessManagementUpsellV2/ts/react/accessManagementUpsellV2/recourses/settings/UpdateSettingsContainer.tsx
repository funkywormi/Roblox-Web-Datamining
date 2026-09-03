import React, { useEffect } from 'react';
import { TranslateFunction, withTranslations } from 'react-utilities';
import { TUpdateSettingsModalProps } from 'Roblox';
import { updateSettingsTranslationConfig } from '../../app.config';
import useUpdateSettingsModal from './hooks/useUpdateSettingsModal';
import { RecourseResponse } from '../../types/AmpTypes';
import { getModalShownEvent } from './services/eventService';

const UpdateSettingsContainer = ({
  translate,
  recourse, // TODO: integrate the acceptable setting values required to satisfy the recourse requirements
  updateSettingsModalProps
}: {
  translate: TranslateFunction;
  recourse: RecourseResponse;
  updateSettingsModalProps: TUpdateSettingsModalProps;
}): JSX.Element => {
  const [updateSettingsModal, updateSettingsModalService] = useUpdateSettingsModal(
    translate,
    updateSettingsModalProps,
    recourse.userSettings
  );

  useEffect(() => {
    getModalShownEvent(recourse.userSettings.settingName, recourse.userSettings.settingValue);
    updateSettingsModalService.open();
  }, []);

  return <div>{updateSettingsModal}</div>;
};

export default withTranslations(UpdateSettingsContainer, updateSettingsTranslationConfig);
