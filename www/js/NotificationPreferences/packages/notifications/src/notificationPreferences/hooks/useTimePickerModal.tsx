import React from 'react';
import { IModalService } from 'react-style-guide';
import { WithTranslationsProps } from 'react-utilities';
import useTimeSelector from './useTimeSelector';
import useConfirmationModal from './useConfirmationModal';

type TTimePickerModal = (props: {
  titleText: string;
  bodyText: string;
  actionButtonText: string;
  onAction?: (selectedTime: number) => void;
  neutralButtonText?: string;
  onNeutral?: () => void;
  closeable?: boolean;
  initTimeMinutes?: number;
  translate: WithTranslationsProps['translate'];
  invalidTimeMinutes: number;
}) => [JSX.Element, IModalService];

const useTimePickerModal: TTimePickerModal = ({
  titleText,
  bodyText,
  actionButtonText,
  onAction,
  neutralButtonText,
  closeable = true,
  initTimeMinutes = 0,
  translate,
  invalidTimeMinutes
}): [JSX.Element, IModalService] => {
  const [selectedTime, timeSelector, resetTime, isTimeValid] = useTimeSelector(
    initTimeMinutes ?? 0,
    translate('Label.DoNotDisturb.Hour'),
    translate('Label.DoNotDisturb.Minute'),
    translate('Label.DoNotDisturb.AMPM'),
    translate('Label.DoNotDisturb.CapitalizedAM'),
    translate('Label.DoNotDisturb.CapitalizedPM')
  );

  // time modal definition
  const timeBody = (
    <div className='do-not-disturb-time-container'>
      <div className='text-description modal-description'>{bodyText}</div>
      {timeSelector}
      {selectedTime === invalidTimeMinutes && (
        <div className='text-error'>{translate('Error.TimeWindowTooShort')}</div>
      )}
    </div>
  );

  const [confirmationModal, confirmationModalService] = useConfirmationModal({
    titleText,
    bodyComponent: timeBody,
    actionButtonText,
    neutralButtonText,
    closeable,
    onAction: () => {
      onAction?.(selectedTime);
    },
    onNeutral: () => {
      resetTime(initTimeMinutes);
    },
    disableActionButton: selectedTime === invalidTimeMinutes
  });

  return [confirmationModal, confirmationModalService];
};

export default useTimePickerModal;
