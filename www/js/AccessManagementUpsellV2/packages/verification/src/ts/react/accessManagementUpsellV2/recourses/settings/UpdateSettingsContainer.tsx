import React, { useEffect } from 'react';
import type { TranslateFunction } from '@rbx/core-scripts/react';
import { useUpdateSettingsTranslate } from '../../hooks/useAmpTranslate';
import type { TUpdateSettingsModalProps } from '@rbx/legacy-webapp-types/Roblox/accessManagementUpsellService';
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
}): React.JSX.Element => {
  const [updateSettingsModal, updateSettingsModalService] = useUpdateSettingsModal(
    translate,
    updateSettingsModalProps,
    recourse.userSettings!
  );

  useEffect(() => {
    getModalShownEvent(recourse.userSettings!.settingName, recourse.userSettings!.settingValue);
    updateSettingsModalService.open();
  }, []);

  return <div>{updateSettingsModal}</div>;
};

const UpdateSettingsContainerWithTranslations = (
  props: Omit<React.ComponentProps<typeof UpdateSettingsContainer>, 'translate'> & { translate?: TranslateFunction }
): React.JSX.Element => {
  const translate = useUpdateSettingsTranslate();
  return <UpdateSettingsContainer {...props} translate={translate} />;
};

export default UpdateSettingsContainerWithTranslations;
