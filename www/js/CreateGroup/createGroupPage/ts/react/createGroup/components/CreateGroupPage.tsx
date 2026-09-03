import React, { useCallback } from 'react';
import { useTranslation } from 'react-utilities';
import { Button, TextArea, TextInput, RadioGroup, Radio, Divider } from '@rbx/foundation-ui';
import { useSystemFeedback } from 'react-style-guide';
import { GroupConfigurationMetadata } from '../../shared/types';
import { ConfigureGroupUiResponse } from '../../shared/services/guacService';
import configureGroupInformationConstants from '../../configureGroupInformation/constants/configureGroupInformationConstants';
import SectionContainerHeader from '../../shared/components/SectionContainerHeader';
import FileUploadWithError from '../../shared/components/fileUpload/components/FileUploadWithError';

type CreateGroupRequest = {
  name: string;
  description: string;
  isGroupPublic: string;
};

type CreateGroupErrorMessages = {
  name?: string;
  description?: string;
  groupIcon?: string;
  groupCoverPhoto?: string;
};

type UploadInfo = {
  maxFileSizeInMegabytes: number;
};

type CreateGroupPageProps = {
  metadata: GroupConfigurationMetadata;
  policies: ConfigureGroupUiResponse;
  createGroupRequest: CreateGroupRequest;
  errorMessages: CreateGroupErrorMessages;
  iconUploadInfo: UploadInfo;
  coverPhotoUploadInfo: UploadInfo;
  creationInProgress: boolean;
  isCreateGroupButtonDisabled: () => boolean;
  onClickPurchaseCreateGroup: () => void;
  setName: (value: string) => void;
  setDescription: (value: string) => void;
  setIsGroupPublic: (value: 'true' | 'false') => void;
  setIconFile: (file: File | null) => void;
  setCoverPhotoFile: (file: File | null) => void;
  cancelUrl: string;
};

const CreateGroupPage: React.FC<CreateGroupPageProps> = ({
  metadata,
  policies,
  createGroupRequest,
  errorMessages,
  iconUploadInfo,
  coverPhotoUploadInfo,
  creationInProgress,
  isCreateGroupButtonDisabled,
  onClickPurchaseCreateGroup,
  setName,
  setDescription,
  setIsGroupPublic,
  setIconFile,
  setCoverPhotoFile,
  cancelUrl
}) => {
  const { translate } = useTranslation();
  const { SystemFeedbackComponent } = useSystemFeedback();

  const handleNameChange = useCallback(
    (value: string) => {
      setName(value);
    },
    [setName]
  );

  const handleDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(event.target.value);
    },
    [setDescription]
  );

  const handleIconChange = useCallback(
    (files: FileList) => {
      const file = files && files.length > 0 ? files[0] : null;
      setIconFile(file);
    },
    [setIconFile]
  );

  const handleCoverPhotoChange = useCallback(
    (files: FileList) => {
      const file = files && files.length > 0 ? files[0] : null;
      setCoverPhotoFile(file);
    },
    [setCoverPhotoFile]
  );

  const { maxFileSizeInMegabytes: iconMaxMb } = iconUploadInfo;
  const { maxFileSizeInMegabytes: coverMaxMb } = coverPhotoUploadInfo;

  const {
    nameMaxLength,
    descriptionMaxLength,
    validCoverPhotoDimensions,
    cost
  } = metadata.groupConfiguration;

  const nameValue = createGroupRequest.name || '';
  const descriptionValue = createGroupRequest.description || '';

  const isPublic = createGroupRequest.isGroupPublic !== 'false';

  const nameCharacterCountText = `${nameValue.length} / ${nameMaxLength}`;

  const characterCountText = `${descriptionValue.length} / ${descriptionMaxLength}`;

  return (
    <div className='section create-group'>
      <div className='section-content remove-panel create-group-content'>
        <div className='container-header'>
          <h1>{translate('Label.CreateGroup')}</h1>
        </div>
        <div className='padding-bottom-small'>
          <SectionContainerHeader title={`${translate('Label.NameGroup')}*`} />
          <TextInput
            size='Medium'
            value={nameValue}
            maxLength={nameMaxLength}
            isDisabled={creationInProgress}
            onChange={e => handleNameChange(e.target.value)}
          />
          {errorMessages.name && (
            <span className='content-action-alert text-caption-small' style={{ float: 'left' }}>
              {errorMessages.name}
            </span>
          )}
          <div className='text-align-x-right padding-top-small'>
            <p className='text-label-small'>{nameCharacterCountText}</p>
          </div>
        </div>

        <div className='padding-bottom-small'>
          <SectionContainerHeader title={translate('Heading.Description')} />
          <TextArea
            className='inline-flex'
            size='Medium'
            rows={10}
            value={descriptionValue}
            maxLength={descriptionMaxLength}
            isDisabled={creationInProgress}
            onChange={e =>
              handleDescriptionChange((e as unknown) as React.ChangeEvent<HTMLTextAreaElement>)
            }
          />
          {errorMessages.description && (
            <span className='content-action-alert text-caption-small' style={{ float: 'left' }}>
              {errorMessages.description}
            </span>
          )}
          <div className='text-align-x-right padding-top-small'>
            <p className='text-label-small'>{characterCountText}</p>
          </div>
        </div>

        {policies.displayUploadGroupIcon && (
          <div className='padding-bottom-small'>
            <SectionContainerHeader title={`${translate('Label.CreateGroupEmblem')}*`} />
            <FileUploadWithError
              onChange={handleIconChange}
              maxFileSizeInMb={iconMaxMb}
              blockOnValidationError
              errorMessage={errorMessages.groupIcon ?? null}
              translationKeys={configureGroupInformationConstants.translationKeys.emblem}
            />
          </div>
        )}

        {policies.displayCoverPhotoUpload && (
          <div className='create-group-cover-photo-upload padding-bottom-small'>
            <SectionContainerHeader title={translate('Label.CreateGroupCoverPhoto')} />
            <div className='text-description'>
              {translate('Description.UpdateGroupCoverPhoto', {
                dimensions: validCoverPhotoDimensions?.split(',').join(', ')
              })}
            </div>
            <FileUploadWithError
              onChange={handleCoverPhotoChange}
              maxFileSizeInMb={coverMaxMb}
              blockOnValidationError
              errorMessage={errorMessages.groupCoverPhoto ?? null}
              translationKeys={configureGroupInformationConstants.translationKeys.coverPhoto}
            />
          </div>
        )}

        {policies.displayGroupPrivacySettings && (
          <React.Fragment>
            <SectionContainerHeader title={translate('Heading.Settings')} />
            <RadioGroup
              className='bg-surface-300 padding-medium'
              value={isPublic ? 'true' : 'false'}
              onValueChange={value => setIsGroupPublic(value as 'true' | 'false')}>
              <Radio value='true' label={translate('Label.AnyoneCanJoin')} />
              <Divider />
              <Radio value='false' label={translate('Label.ManualApproval')} />
            </RadioGroup>
          </React.Fragment>
        )}

        <div className='text-align-x-right margin-top-small flex' style={{ float: 'right' }}>
          <Button
            className='inline-flex'
            style={{ marginRight: '8px' }}
            variant='Standard'
            size='Medium'
            onClick={() => {
              window.location.href = cancelUrl;
            }}>
            {translate('Action.Cancel')}
          </Button>
          <Button
            className='inline-flex'
            variant='Emphasis'
            size='Medium'
            isDisabled={isCreateGroupButtonDisabled()}
            onClick={onClickPurchaseCreateGroup}>
            <span className='icon-robux-white-16x16' />
            <span className='text-align-y-center'>{cost}</span>
          </Button>
        </div>
      </div>
      <SystemFeedbackComponent />
    </div>
  );
};

export default CreateGroupPage;
