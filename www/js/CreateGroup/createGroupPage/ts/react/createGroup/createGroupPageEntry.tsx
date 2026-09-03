import Roblox from 'Roblox';
import React from 'react';
import { render } from 'react-dom';
import { SystemFeedbackProvider } from 'react-style-guide';
import { TranslationProvider } from 'react-utilities';
import { groupsConfig } from '../shared/translation.config';
import CreateGroupPage from './components/CreateGroupPage';
import '../../../css/tailwind.css';
import '../../../css/configureGroup.scss';
import { GroupConfigurationMetadata } from '../shared/types';
import { ConfigureGroupUiResponse } from '../shared/services/guacService';

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

type CreateGroupInitialData = {
  metadata: GroupConfigurationMetadata;
  policies: ConfigureGroupUiResponse;
  createGroupRequest: CreateGroupRequest;
  errorMessages: CreateGroupErrorMessages;
  iconUploadInfo: UploadInfo;
  coverPhotoUploadInfo: UploadInfo;
  creationInProgress: boolean;
  isCreateGroupButtonDisabled: () => boolean;
  onClickPurchaseCreateGroup: () => void;
  cancelUrl: string;
  setName: (value: string) => void;
  setDescription: (value: string) => void;
  setIsGroupPublic: (value: 'true' | 'false') => void;
  setIconFile: (file: File | null) => void;
  setCoverPhotoFile: (file: File | null) => void;
};

const renderCreateGroup = (container: Element, initialData: CreateGroupInitialData) => {
  render(
    <SystemFeedbackProvider>
      <TranslationProvider config={groupsConfig}>
        <CreateGroupPage
          metadata={initialData.metadata}
          policies={initialData.policies}
          createGroupRequest={initialData.createGroupRequest}
          errorMessages={initialData.errorMessages}
          iconUploadInfo={initialData.iconUploadInfo}
          coverPhotoUploadInfo={initialData.coverPhotoUploadInfo}
          creationInProgress={initialData.creationInProgress}
          isCreateGroupButtonDisabled={initialData.isCreateGroupButtonDisabled}
          onClickPurchaseCreateGroup={initialData.onClickPurchaseCreateGroup}
          cancelUrl={initialData.cancelUrl}
          setName={initialData.setName}
          setDescription={initialData.setDescription}
          setIsGroupPublic={initialData.setIsGroupPublic}
          setIconFile={initialData.setIconFile}
          setCoverPhotoFile={initialData.setCoverPhotoFile}
        />
      </TranslationProvider>
    </SystemFeedbackProvider>,
    container
  );
};

const CreateGroupService = {
  renderCreateGroup
};

Object.assign(Roblox, {
  CreateGroupService
});
