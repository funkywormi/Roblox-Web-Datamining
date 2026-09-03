import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-utilities';
import GroupSecuritySettingsToggle from './GroupSecuritySettingsToggle';
import GroupSecuritySettingsToggleGroup from './GroupSecuritySettingsToggleGroup';
import { SingleSelection } from '../../shared/components/SingleSelection';
import {
  VERIFICATION_LEVEL_OPTION_TEMPLATES,
  ACCOUNT_TENURE_OPTION_TEMPLATES,
  translateOptions
} from '../constants/groupSecuritySettingsOptions';
import { ConfigureGroupUiResponse } from '../../shared/services/guacService';
import { GroupSettings } from '../services/groupSettingsService';
import SectionContainerHeader from '../../shared/components/SectionContainerHeader';

export type ConfigureGroupSettingsProps = {
  settings: GroupSettings;
  policies: ConfigureGroupUiResponse;
  layout: {
    settingsError?: string;
    isOwner: boolean;
  };
  isLoading: boolean;
  onSettingChange: (settingName: string, value: string | boolean) => void;
  canManageRelationships: boolean;
};

const ConfigureGroupSettingsSection: React.FC<ConfigureGroupSettingsProps> = ({
  settings,
  policies,
  layout,
  isLoading,
  onSettingChange,
  canManageRelationships
}) => {
  const { translate } = useTranslation();

  const verificationLevelOptions = useMemo(
    () => translateOptions(VERIFICATION_LEVEL_OPTION_TEMPLATES, translate),
    [translate]
  );

  const accountTenureOptions = useMemo(
    () => translateOptions(ACCOUNT_TENURE_OPTION_TEMPLATES, translate),
    [translate]
  );

  const toggleIsApprovalRequired = useCallback(
    (newValue: boolean) => {
      onSettingChange('isApprovalRequired', newValue);
    },
    [onSettingChange]
  );

  const handleVerificationChange = useCallback(
    (value: string) => {
      onSettingChange('verificationLevel', value);
    },
    [onSettingChange]
  );

  const handleAccountTenureChange = useCallback(
    (value: string) => {
      onSettingChange('accountTenureRequirement', value);
    },
    [onSettingChange]
  );

  const toggleAreGroupFundsVisible = useCallback(
    (newValue: boolean) => {
      onSettingChange('areGroupFundsVisible', newValue);
    },
    [onSettingChange]
  );

  const toggleAreGroupGamesVisible = useCallback(
    (newValue: boolean) => {
      onSettingChange('areGroupGamesVisible', newValue);
    },
    [onSettingChange]
  );

  const toggleAreEnemiesAllowed = useCallback(
    (newValue: boolean) => {
      onSettingChange('areEnemiesAllowed', newValue);
    },
    [onSettingChange]
  );

  const toggleIsMemberListVisibleToPublic = useCallback(
    (newValue: boolean) => {
      onSettingChange('isMemberListVisibleToPublic', newValue);
    },
    [onSettingChange]
  );

  // Early return if settings not loaded yet
  if (!settings) {
    return null;
  }

  return (
    <React.Fragment>
      {/* Show error if present */}
      {layout.settingsError && (
        <div className='col-xs-12 section-content-off'>{layout.settingsError}</div>
      )}

      {/* Show main content if: no error OR loading */}
      {(!layout.settingsError || isLoading) && (
        <div className='section configure-group-settings-content'>
          {layout.isOwner && (
            <React.Fragment>
              {/* Join Requirements Header */}
              {policies.displayGroupPrivacySettings && (
                <SectionContainerHeader title={translate('Heading.JoinRequirements')} />
              )}

              {/* Manual Approval Setting */}
              {policies.displayGroupPrivacySettings && (
                <div
                  className='section-content remove-panel'
                  data-testid='manual-approval-settings-section'>
                  <div className='section-content'>
                    <GroupSecuritySettingsToggle
                      featureName='isApprovalRequired'
                      label={translate('Label.ManualApproval')}
                      description={translate('Label.MustBeAccepted')}
                      isOn={settings.isApprovalRequired}
                      onToggle={toggleIsApprovalRequired}
                    />
                  </div>
                </div>
              )}

              {/* Verification Level */}
              {policies.isGroupVerificationRequiredToJoin && (
                <div id='verification-level-section' className='section-content remove-panel'>
                  <div className='section-content'>
                    <SingleSelection
                      options={verificationLevelOptions}
                      value={settings.verificationLevel}
                      onChange={handleVerificationChange}
                      header={translate('Label.VerificationLevel')}
                    />
                  </div>
                </div>
              )}

              {/* Account Tenure Requirement */}
              {policies.displayAccountTenureVerification && (
                <div id='account-tenure-section' className='section-content remove-panel'>
                  <div className='section-content'>
                    <SingleSelection
                      options={accountTenureOptions}
                      value={settings.accountTenureRequirement}
                      onChange={handleAccountTenureChange}
                      header={translate('Label.AccountTenure')}
                      subheader={translate('Description.AccountTenureRequirementExplanation')}
                    />
                  </div>
                </div>
              )}

              {/* Group Profile Settings */}
              <div id='group-profile-settings-section' className='section-content remove-panel'>
                <SectionContainerHeader title={translate('Heading.GroupProfile')} />

                <div className='section-content'>
                  <GroupSecuritySettingsToggleGroup>
                    <GroupSecuritySettingsToggle
                      featureName='areGroupFundsVisible'
                      label={translate('Label.FundsVisible')}
                      isOn={settings.areGroupFundsVisible}
                      onToggle={toggleAreGroupFundsVisible}
                    />
                    <GroupSecuritySettingsToggle
                      featureName='areGroupGamesVisible'
                      label={translate('Label.GamesVisible')}
                      isOn={settings.areGroupGamesVisible}
                      onToggle={toggleAreGroupGamesVisible}
                    />
                    {policies.displayMemberListVisibilityConfiguration && (
                      <GroupSecuritySettingsToggle
                        featureName='isMemberListVisibleToPublic'
                        label={translate('Label.MemberListVisible')}
                        isOn={settings.isMemberListVisibleToPublic}
                        onToggle={toggleIsMemberListVisibleToPublic}
                      />
                    )}
                  </GroupSecuritySettingsToggleGroup>
                </div>
              </div>
            </React.Fragment>
          )}

          {/* Affiliates Settings */}
          {canManageRelationships && (
            <div id='affiliates-settings-section' className='section-content remove-panel'>
              <SectionContainerHeader title={translate('Heading.Affiliates')} />

              <div className='section-content'>
                <GroupSecuritySettingsToggle
                  featureName='areEnemiesAllowed'
                  label={translate('Label.AllowDeclarations')}
                  isOn={settings.areEnemiesAllowed}
                  onToggle={toggleAreEnemiesAllowed}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </React.Fragment>
  );
};

export default ConfigureGroupSettingsSection;
