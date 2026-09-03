import { EnvironmentUrls } from 'Roblox';
import { SlowModeConfig } from '../types';

const { groupsApi } = EnvironmentUrls;

const groupsApiUrlPrefix = `${groupsApi}/v1/groups`;

export enum SlowModeLevel {
  Disabled = 0,
  Slow = 1,
  Slower = 2,
  Slowest = 3
}

const slowModeConfig: SlowModeConfig = {
  translationKeys: {
    labels: {
      [SlowModeLevel.Disabled]: 'Label.SlowMode.Disabled',
      [SlowModeLevel.Slow]: 'Label.SlowMode.Slow',
      [SlowModeLevel.Slower]: 'Label.SlowMode.Slower',
      [SlowModeLevel.Slowest]: 'Label.SlowMode.Slowest'
    },
    descriptions: {
      [SlowModeLevel.Disabled]: 'Description.SlowMode.Disabled',
      [SlowModeLevel.Slow]: 'Description.SlowMode.Slow',
      [SlowModeLevel.Slower]: 'Description.SlowMode.Slower',
      [SlowModeLevel.Slowest]: 'Description.SlowMode.Slowest'
    },
    headings: {
      activitySettings: 'Heading.ActivitySettings',
      slowMode: 'Label.SlowMode',
      slowModeDescription: 'Description.SlowMode'
    },
    messages: {
      settingsSaved: 'Message.SettingsSaved',
      settingsSaveFailed: 'Message.SettingsSaveFailed'
    }
  },
  options: [SlowModeLevel.Disabled, SlowModeLevel.Slow, SlowModeLevel.Slower, SlowModeLevel.Slowest]
};

export default {
  urls: {
    getBlockedKeywordsEndpoint(groupId: number): string {
      return `${groupsApiUrlPrefix}/${groupId}/blocked-keywords`;
    },
    groupFeatureSettingsEndpoint(groupId: number): string {
      return `${groupsApiUrlPrefix}/${groupId}/settings`;
    }
  },
  limits: {
    maxAddBlockedKeywordInputLength: 500,
    maxBlockedKeywordLength: 50,
    minBlockedKeywordLength: 2,
    maxBlockedKeywordCountPerRequest: 50
  },
  blockedKeywords: {
    wildcard: '*'
  },
  pageCounts: {
    blockedKeywordsPerPage: 10
  },
  paging: {
    next: 1,
    previous: 2
  },
  queryKeys: {
    activitySettings: 'activitySettings',
    blockedKeywordsList: 'blockedKeywordsList'
  },
  errorCodes: {
    blockedKeywordModerated: 12,
    invalidRequest: 4,
    conflict: 11
  },
  articles: {
    learnMoreUrl: 'https://help.roblox.com/hc/articles/39129357139348'
  },
  translations: {
    ValidationEditKeywordEmpty: 'Error.EditKeywordEmpty',
    ValidationCreateKeywordEmpty: 'Error.CreateKeywordEmpty',
    ValidationKeywordCannotBeOnlyWildcard: 'Error.CreateKeywordCannotBeOnlyWildcard',
    ValidationKeywordTooLong: 'Error.CreateKeywordTooLong',
    ValidationKeywordTooShort: 'Error.CreateKeywordTooShort'
  },
  slowModeConfig
};
