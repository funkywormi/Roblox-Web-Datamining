import React, { useState } from 'react';
import { Thumbnail2d, ThumbnailFormat, DefaultThumbnailSize } from 'roblox-thumbnails';
import { WithTranslationsProps } from 'react-utilities';
import { createSystemFeedback } from 'react-style-guide';
import ClassNames from 'classnames';
import { sendNotificationPreferencesEvent } from '../services/NotificationPreferencesService';
import events from '../constants/notificationPreferencesEvents';
import ToggleButton from './ToggleButton';
import useConfirmationModal from '../hooks/useConfirmationModal';
import NotificationConstants from '../constants/notificationPreferencesConstants';

export type ThumbnailPreferenceSelectorProps = {
  entityId: number;
  entityName: string;
  truncatedEntityName: string;
  entityCreatorName: string;
  entityType: string;
  hasBorder: boolean;
  unsubscribeCallback: (newSelection: boolean) => Promise<boolean>;
  hasToggle?: boolean;
  initToggle: boolean | void;
  selectionDisabled?: boolean;
  translate: WithTranslationsProps['translate'];
};

const ThumbnailPreferenceSelector = ({
  entityId,
  entityName,
  entityType,
  truncatedEntityName,
  entityCreatorName,
  hasBorder,
  hasToggle,
  initToggle,
  unsubscribeCallback,
  selectionDisabled,
  translate
}: ThumbnailPreferenceSelectorProps): JSX.Element => {
  const [toggleOn, setToggleOn] = useState<boolean>(!!initToggle);
  const [SystemFeedback, systemFeedbackService] = createSystemFeedback();

  const displayGeneralErrorMessage = () => {
    systemFeedbackService.warning(translate('Message.ErrorGeneral'));
  };

  const onTogglePreference = async (newSelection: boolean) => {
    if (!newSelection) {
      sendNotificationPreferencesEvent(events.promptUnsubscribe, entityId.toString());
    }
    const success = await unsubscribeCallback(newSelection);
    if (success) {
      setToggleOn(newSelection);
    } else {
      displayGeneralErrorMessage();
    }
  };
  const [confirmationModal, confirmationModalService] = useConfirmationModal({
    titleText: translate('Heading.AreYouSure'),
    bodyComponent: translate('Body.TurnOffExperienceNotifications', {
      experienceName: truncatedEntityName
    }),
    actionButtonText: translate('Action.TurnOff'),
    neutralButtonText: translate('Action.Cancel'),
    onAction: () => onTogglePreference(false)
  });
  return (
    <div
      className={ClassNames('preference-button-wrapper', {
        'border-top': hasBorder,
        'text-disabled': selectionDisabled
      })}>
      <div className='preference-button '>
        <Thumbnail2d
          type={NotificationConstants.GroupToThumbnailType[entityType]!}
          size={DefaultThumbnailSize}
          format={ThumbnailFormat.webp}
          targetId={entityId}
          containerClass='preference-thumbnail'
        />
        <div className='preference-info-wrapper'>
          <div className='small text text-emphasis preference-name'>{entityName}</div>
          <div className='small text text-content'>{entityCreatorName}</div>
        </div>
        {(hasToggle ?? true) && (
          <div className='toggle-button-container' data-testid='toggle-button-container'>
            <ToggleButton
              onChangeCallback={async (selection: boolean) => {
                if (!selection) {
                  confirmationModalService.open();
                } else {
                  await onTogglePreference(selection);
                }
              }}
              selection={toggleOn}
              selectionDisabled={selectionDisabled}
            />
          </div>
        )}
      </div>
      <SystemFeedback />
      {confirmationModal}
    </div>
  );
};

export default ThumbnailPreferenceSelector;
