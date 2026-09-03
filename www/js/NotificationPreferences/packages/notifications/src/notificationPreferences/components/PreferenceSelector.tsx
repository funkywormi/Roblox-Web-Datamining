import React from 'react';
import ClassNames from 'classnames';
import ToggleButton from './ToggleButton';
import GroupLockedPill from './GroupLockedPill';
import { UserSetting } from '../types/UserSettingsTypes';

export type PreferenceSelectorProps = {
  userSettingName?: string;
  userSetting?: UserSetting;
  localizedTypeName: string;
  localizedDescription: string;
  onTogglePreference: (
    newSelection: boolean,
    userSetting: UserSetting | null | undefined,
    userSettingName: string | null
  ) => void;
  hasBorder?: boolean | undefined;
  selection: boolean;
  selectionDisabled?: boolean;
  showLockOnToggle?: boolean;
  renderAdditionalContent?: () => React.ReactNode;
};

const PreferenceSelector = ({
  userSettingName,
  userSetting,
  localizedTypeName,
  localizedDescription,
  selection,
  onTogglePreference,
  hasBorder,
  selectionDisabled,
  showLockOnToggle,
  renderAdditionalContent
}: PreferenceSelectorProps): JSX.Element | null => {
  const onChangeCallback = (newSelection: boolean) => {
    onTogglePreference(newSelection, userSetting, userSettingName ?? null);
  };

  return (
    <div className='preference-selector'>
      <div
        className={ClassNames('preference-selector-header', {
          'border-top': hasBorder
        })}>
        <div
          className={ClassNames('notification-type-info', { 'text-disabled': selectionDisabled })}>
          <div className='notification-type heading text text-emphasis'>{localizedTypeName}</div>
          <div className='notification-type-descriptor small text text-content'>
            {localizedDescription}
          </div>
        </div>
        <div className='toggle-button-container'>
          {showLockOnToggle && <GroupLockedPill />}
          <ToggleButton
            selectionDisabled={selectionDisabled}
            onChangeCallback={onChangeCallback}
            selection={selection}
          />
        </div>
      </div>
      <div className={ClassNames({ 'text-disabled': selectionDisabled })}>
        {renderAdditionalContent?.()}
      </div>
    </div>
  );
};

export default PreferenceSelector;
