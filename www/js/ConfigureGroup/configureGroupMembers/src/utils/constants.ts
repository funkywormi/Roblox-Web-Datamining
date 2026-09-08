import type { RobloxGroupsApiModelsResponseUserModel } from '@rbx/client-groups/v2';
import { V2GroupsGroupIdUsersGetLimitEnum } from '@rbx/client-groups/v2';
import type {
  GroupRoleColorType,
  GroupRoleMetadata,
  GroupUserRole,
  GroupUserWithRoles,
} from '../clients/groups';
import { GroupRoleColor } from '../clients/groups';

export const MembersPageSize = V2GroupsGroupIdUsersGetLimitEnum.NUMBER_10;

export type RoleColorTokens = {
  light: string;
  dark: string;
  translationKey: string;
};

/** Maps each color enum value to Foundation CSS token names for light/dark mode. */
export const RoleColorTokenMap: Record<GroupRoleColorType, RoleColorTokens> = {
  [GroupRoleColor.NUMBER_0]: {
    light: 'light-mode-content-emphasis',
    dark: 'dark-mode-content-emphasis',
    translationKey: 'Label.RoleColorDefault',
  },
  [GroupRoleColor.NUMBER_1]: {
    light: 'color-extended-blue-600',
    dark: 'color-extended-blue-500',
    translationKey: 'Label.RoleColorBlue',
  },
  [GroupRoleColor.NUMBER_2]: {
    light: 'color-extended-green-800',
    dark: 'color-extended-green-500',
    translationKey: 'Label.RoleColorGreen',
  },
  [GroupRoleColor.NUMBER_3]: {
    light: 'color-extended-purple-800',
    dark: 'color-extended-purple-600',
    translationKey: 'Label.RoleColorPurple',
  },
  [GroupRoleColor.NUMBER_4]: {
    light: 'color-extended-yellow-800',
    dark: 'color-extended-yellow-500',
    translationKey: 'Label.RoleColorYellow',
  },
  [GroupRoleColor.NUMBER_5]: {
    light: 'color-extended-orange-700',
    dark: 'color-extended-orange-500',
    translationKey: 'Label.RoleColorOrange',
  },
  [GroupRoleColor.NUMBER_6]: {
    light: 'color-extended-red-800',
    dark: 'color-extended-red-700',
    translationKey: 'Label.RoleColorRed',
  },
  [GroupRoleColor.NUMBER_7]: {
    light: 'color-extended-magenta-700',
    dark: 'color-extended-magenta-600',
    translationKey: 'Label.RoleColorMagenta',
  },
  [GroupRoleColor.NUMBER_8]: {
    light: 'color-extended-turquoise-700',
    dark: 'color-extended-turquoise-300',
    translationKey: 'Label.RoleColorTeal',
  },
  [GroupRoleColor.NUMBER_9]: {
    light: 'color-extended-turquoise-1200',
    dark: 'color-extended-turquoise-900',
    translationKey: 'Label.RoleColorTurquoise',
  },
  [GroupRoleColor.NUMBER_10]: {
    light: 'color-extended-orange-900',
    dark: 'color-extended-orange-700',
    translationKey: 'Label.RoleColorRust',
  },
  [GroupRoleColor.NUMBER_11]: {
    light: 'color-extended-green-700',
    dark: 'color-extended-green-200',
    translationKey: 'Label.RoleColorPistachio',
  },
  [GroupRoleColor.NUMBER_12]: {
    light: 'color-extended-blue-1100',
    dark: 'color-extended-blue-900',
    translationKey: 'Label.RoleColorMidnight',
  },
  [GroupRoleColor.NUMBER_13]: {
    light: 'color-extended-purple-1100',
    dark: 'color-extended-purple-900',
    translationKey: 'Label.RoleColorLavender',
  },
  [GroupRoleColor.NUMBER_14]: {
    light: 'color-extended-pink-700',
    dark: 'color-extended-pink-400',
    translationKey: 'Label.RoleColorPink',
  },
  [GroupRoleColor.NUMBER_15]: {
    light: 'color-extended-red-1100',
    dark: 'color-extended-red-900',
    translationKey: 'Label.RoleColorCrimson',
  },
  [GroupRoleColor.NUMBER_16]: {
    light: 'color-extended-magenta-1000',
    dark: 'color-extended-magenta-800',
    translationKey: 'Label.RoleColorPlum',
  },
};

export const DefaultRoleColor = GroupRoleColor.NUMBER_0;

/**
 * Returns the Foundation CSS token name for a role color dot.
 * The default color swaps light/dark tokens when unselected to appear muted.
 */
export function getColorDotTokens(
  roleColor: GroupRoleColorType,
  selectedColor: GroupRoleColorType | null | undefined,
  themeMode: string,
): string {
  const tokens = RoleColorTokenMap[roleColor];
  if (roleColor !== DefaultRoleColor) {
    return themeMode === 'dark' ? tokens.dark : tokens.light;
  }
  if (selectedColor === roleColor) {
    return themeMode === 'dark' ? tokens.dark : tokens.light;
  }
  return themeMode === 'dark' ? tokens.light : tokens.dark;
}

export const PickableRoleColorsList: GroupRoleColorType[] = [
  GroupRoleColor.NUMBER_6,
  GroupRoleColor.NUMBER_15,
  GroupRoleColor.NUMBER_5,
  GroupRoleColor.NUMBER_10,
  GroupRoleColor.NUMBER_4,
  GroupRoleColor.NUMBER_11,
  GroupRoleColor.NUMBER_2,
  GroupRoleColor.NUMBER_8,
  GroupRoleColor.NUMBER_9,
  GroupRoleColor.NUMBER_1,
  GroupRoleColor.NUMBER_12,
  GroupRoleColor.NUMBER_3,
  GroupRoleColor.NUMBER_13,
  GroupRoleColor.NUMBER_7,
  GroupRoleColor.NUMBER_16,
  GroupRoleColor.NUMBER_14,
  GroupRoleColor.NUMBER_0,
];

// Arrakis-computed ID: ((long)GroupRelationship.Member.EntityType << 32) + GroupRelationship.Member.Value
export const DefaultMemberRoleId = '12884901889';
export const DefaultMemberRoleIdNumber = 12884901889;

// Guest role can only be identified by rank of 0. Guest role will be deprecated in the future.
export const GuestRoleRank = 0;

export const DefaultMemberIdPlaceholder = '-1';

export const noResultsIconPath = `${process.env.assetPathPrefix}/group/no_results.svg`;

export const MaximumRoles = 100;

export const DefaultRoleNameMaxLength = 100;
export const DefaultRoleDescriptionMaxLength = 999;
export const DefaultRoleMinRank = 0;
export const DefaultRoleMaxRank = 255;
export const DefaultNewRoleRank = 1;

export const RoleVisibility = {
  Public: 'public',
  Private: 'private',
} as const;

export const InviteQueryKey = 'invitationGroupId';

export enum GroupMembersMenuState {
  Members = 'Members',
  Invited = 'Invited',
}

export type InvitedMember = {
  userId?: string;
  user?: RobloxGroupsApiModelsResponseUserModel;
  roles?: Array<GroupRoleMetadata> | undefined;
  invitationId: string;
};

export type Member = GroupUserWithRoles | InvitedMember;

export type MemberRole = GroupUserRole | GroupRoleMetadata;
