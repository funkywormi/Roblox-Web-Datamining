export interface Program {
  id: string;
  internalName: string;
  displayName: string;
  description: string;
  testingInstructions: string;
  activeStatus: ProgramActiveStatus;
  visibility: ProgramVisibility;
  channelName: string;
  hasChannelName: boolean;
  platforms: ProgramPlatform[];
  createdBy: string;
  owner: string;
}

export enum ProgramActiveStatus {
  PROGRAM_ACTIVE_STATUS_INVALID = 0,
  PROGRAM_ACTIVE_STATUS_INACTIVE = 1,
  PROGRAM_ACTIVE_STATUS_ADMIN = 2,
  PROGRAM_ACTIVE_STATUS_ALLOWLIST = 3,
  PROGRAM_ACTIVE_STATUS_PUBLIC = 4,
}

export enum ProgramVisibility {
  PROGRAM_VISIBILITY_INVALID = 0,
  PROGRAM_VISIBILITY_ACTIVE = 1,
  PROGRAM_VISIBILITY_ACTIVE_AND_ADMIN = 2,
  PROGRAM_VISIBILITY_ACTIVE_AND_ALLOWLIST = 3,
  PROGRAM_VISIBILITY_PUBLIC = 4,
}

export enum ProgramPlatform {
  PROGRAM_PLATFORM_INVALID = 0,
  PROGRAM_PLATFORM_RCC = 1,
  PROGRAM_PLATFORM_WINDOWS_PLAYER = 2,
  PROGRAM_PLATFORM_WINDOWS_STUDIO = 3,
  PROGRAM_PLATFORM_MAC_PLAYER = 4,
  PROGRAM_PLATFORM_MAC_STUDIO = 5,
  PROGRAM_PLATFORM_IOS_APP = 6,
  PROGRAM_PLATFORM_GOOGLE_ANDROID_APP = 7,
  PROGRAM_PLATFORM_QUEST_ANDROID_APP = 8,
  PROGRAM_PLATFORM_AMAZON_ANDROID_APP = 9,
  PROGRAM_PLATFORM_TENCENT_ANDROID_APP = 10,
  PROGRAM_PLATFORM_PS4_APP = 11,
  PROGRAM_PLATFORM_PS5_APP = 12,
  PROGRAM_PLATFORM_XBOX_APP = 13,
  PROGRAM_PLATFORM_UWP_APP = 14,
}

export const NoProgramSelectedValueString = "-1";
export const NoProgramSelectedLabel = "No Program Selected";
export const EarlyAccessPlaceholder = "Early Access Programs";
