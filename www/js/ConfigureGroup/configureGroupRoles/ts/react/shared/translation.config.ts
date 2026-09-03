import type { TranslationConfig } from 'react-utilities';

export const groupsConfig: TranslationConfig = {
  common: ['Feature.RichTextEditor', 'Feature.GroupManagement'],
  feature: 'Feature.Groups'
};

export const configureGroupConfig: TranslationConfig = {
  common: ['CommonUI.Controls', 'CreatorDashboard.Analytics', 'Feature.GroupManagement'],
  feature: 'Feature.Groups'
};

export const fileUploadConfig: TranslationConfig = {
  common: [],
  feature: 'Feature.FileUploadComponent'
};

export default { groupsConfig, fileUploadConfig };
