import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-utilities';
import { useSystemFeedback } from 'react-style-guide';
import { Button, TextArea } from '@rbx/foundation-ui';
import {
  Group,
  GroupConfiguration,
  GroupConfigurationMetadata,
  ServiceErrorResponse
} from '../../shared/types';
import guacService, { ConfigureGroupUiResponse } from '../../shared/services/guacService';
import configureGroupInformationService from '../services/configureGroupInformationService';
import configureGroupService from '../../shared/services/configureGroupsService';
import configureGroupInformationConstants from '../constants/configureGroupInformationConstants';
import ConfigureGroupInformationFileUpload from './ConfigureGroupInformationFileUpload';
import SectionContainerHeader from '../../shared/components/SectionContainerHeader';
import groupsConstants from '../../shared/constants/groupConstants';

type Props = {
  group: Group;
  metadata: GroupConfigurationMetadata;
};

const ConfigureGroupInformationPage: React.FC<Props> = ({ group, metadata }) => {
  const { translate } = useTranslation();
  const { SystemFeedbackComponent, systemFeedbackService } = useSystemFeedback();

  const [guacPolicies, setGuacPolicies] = useState<ConfigureGroupUiResponse>();
  const [groupConfiguration, setGroupConfiguration] = useState<GroupConfiguration>();
  const [oldDescription, setOldDescription] = useState<string>(group.description ?? '');
  const [description, setDescription] = useState<string>(group.description ?? '');
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [isSavingDescription, setIsSavingDescription] = useState<boolean>(false);

  const getGroupConfiguration = useCallback(async () => {
    const newGroupConfiguration = await configureGroupService.getGroupConfiguration(group.id);
    setGroupConfiguration(newGroupConfiguration);
  }, [group.id]);

  useEffect(() => {
    const loadData = async () => {
      const [newGuacPolicies, _] = await Promise.all([
        guacService.getConfigureGroupUiGuac(),
        getGroupConfiguration()
      ]);
      setGuacPolicies(newGuacPolicies);
    };

    loadData().catch(() => {
      // Silently handle initialization errors
    });
  }, [getGroupConfiguration]);

  const handleSaveDescription = useCallback(async () => {
    setIsSavingDescription(true);
    setDescriptionError(null);
    try {
      if (description.length > metadata.groupConfiguration.descriptionMaxLength) {
        systemFeedbackService.warning(translate('Message.GroupDescriptionUpdateFail'));
        setDescriptionError(translate('Message.DescriptionTooLong'));
        return;
      }
      await configureGroupInformationService.updateGroupDescription(group.id, description);
      systemFeedbackService.success(translate('Message.GroupDescriptionUpdateSuccess'));
      setOldDescription(description);
    } catch (error: unknown) {
      systemFeedbackService.warning(translate('Message.GroupDescriptionUpdateFail'));
      const typedError = error as ServiceErrorResponse;
      switch (typedError.data?.errors?.[0]?.code) {
        case groupsConstants.errorCodes.internal.descriptionModerated:
          setDescriptionError(translate('Message.DescriptionModerated'));
          break;
        case groupsConstants.errorCodes.internal.descriptionTooLong:
          setDescriptionError(translate('Message.DescriptionTooLong'));
          break;
        default:
          setDescriptionError(translate('Message.UnknownError'));
          break;
      }
    } finally {
      setIsSavingDescription(false);
    }
  }, [
    group.id,
    description,
    systemFeedbackService,
    translate,
    metadata.groupConfiguration.descriptionMaxLength
  ]);

  const characterCountText = `${description.length} / ${metadata.groupConfiguration.descriptionMaxLength}`;

  return (
    <React.Fragment>
      {guacPolicies?.displayUploadGroupIcon && (
        <div className='section-content remove-panel' data-testid='configure-group-icon-section'>
          <ConfigureGroupInformationFileUpload
            groupId={group.id}
            onSave={configureGroupInformationService.updateGroupIcon}
            onUpdated={getGroupConfiguration}
            maxFileSizeInMb={metadata.groupConfiguration.iconMaxFileSizeMb}
            blockOnValidationError
            currentAssetId={groupConfiguration?.emblemId ?? 0}
            translationKeys={configureGroupInformationConstants.translationKeys.emblem}
          />
        </div>
      )}
      {guacPolicies?.displayCoverPhotoUpload && (
        <div
          className='section-content remove-panel configure-group-cover-photo-upload'
          data-testid='configure-group-cover-photo-section'>
          <ConfigureGroupInformationFileUpload
            groupId={group.id}
            includeDescription
            dimensions={metadata.groupConfiguration.validCoverPhotoDimensions}
            onSave={configureGroupInformationService.updateGroupCoverPhoto}
            onDelete={configureGroupInformationService.deleteGroupCoverPhoto}
            onUpdated={getGroupConfiguration}
            maxFileSizeInMb={metadata.groupConfiguration.coverPhotoMaxFileSizeMb}
            blockOnValidationError
            currentAssetId={groupConfiguration?.coverPhotoId ?? undefined}
            translationKeys={configureGroupInformationConstants.translationKeys.coverPhoto}
          />
        </div>
      )}

      <div
        className='section-content remove-panel'
        data-testid='configure-group-description-section'>
        <SectionContainerHeader title={translate('Heading.Description')} />
        <div className='padding-bottom-small'>
          <TextArea
            className='inline-flex'
            size='Medium'
            rows={10}
            value={description}
            maxLength={metadata.groupConfiguration.descriptionMaxLength}
            onChange={e => setDescription(e.target.value)}
          />
          {descriptionError && (
            <span className='content-action-alert text-caption-small' style={{ float: 'left' }}>
              {descriptionError}
            </span>
          )}
          <div className='text-align-x-right padding-top-small'>
            <p className='text-label-small'>{characterCountText}</p>
          </div>
        </div>
        <div className='text-align-x-right'>
          <Button
            className='inline-flex'
            variant='Standard'
            size='Medium'
            isDisabled={description === oldDescription || isSavingDescription}
            isLoading={isSavingDescription}
            onClick={handleSaveDescription}>
            {translate('Action.Save')}
          </Button>
        </div>
      </div>
      <SystemFeedbackComponent />
    </React.Fragment>
  );
};

export default ConfigureGroupInformationPage;
