import { httpService } from 'core-utilities';
import Roblox, { EnvironmentUrls } from 'Roblox';
import {
  actionTypes,
  currencyType,
  groupBadgeAuditType,
  merchantType,
  configureGroupAssetAction,
  configureGroupGameAction,
  securitySettingType,
  loadPageSize,
  urls
} from '../constants/auditLogConstants';
import groupConstants from '../../shared/constants/groupConstants';
import {
  AuditLogEntry,
  AuditLogResponse,
  AuditLogDescription,
  AuditLogDescriptionResult,
  AuditLogToken,
  AuditLogPolicies
} from '../types';

const DisplayNames = (Roblox as Record<string, unknown>).DisplayNames as
  | { Enabled?: () => boolean }
  | undefined;

interface GetAuditLogParams {
  groupId: number;
  actionType?: string;
  userId?: number;
  cursor?: string;
  limit?: number;
  sortOrder?: 'Asc' | 'Desc';
}

interface UserIdLookupResponse {
  data: Array<{
    requestedUsername: string;
    id: number;
    name: string;
    displayName: string;
  }>;
}

const formatSeoUrl = (type: string, id: number, name: string): string => {
  const seoName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  switch (type) {
    case 'users':
      return `${EnvironmentUrls.websiteUrl}/users/${id}/profile`;
    case 'groups':
      return `${EnvironmentUrls.websiteUrl}/groups/${id}/${seoName}`;
    case 'games':
      return `${EnvironmentUrls.websiteUrl}/games/${id}/${seoName}`;
    case 'catalog':
      return `${EnvironmentUrls.websiteUrl}/catalog/${id}/${seoName}`;
    case 'game-pass':
      return `${EnvironmentUrls.websiteUrl}/game-pass/${id}/${seoName}`;
    case 'badges':
      return `${EnvironmentUrls.websiteUrl}/badges/${id}/${seoName}`;
    default:
      return `${EnvironmentUrls.websiteUrl}/${type}/${id}/${seoName}`;
  }
};

const linkToken = (name: string, url: string): AuditLogToken => ({ kind: 'link', name, url });

const textToken = (value: string): AuditLogToken => ({ kind: 'text', value });

const translationListToken = (keys: string[]): AuditLogToken => ({
  kind: 'translationList',
  keys
});

const translationToken = (key: string, params?: Record<string, string>): AuditLogToken => ({
  kind: 'translation',
  key,
  params
});

const currencyToken = (amount: number, isRobux: boolean): AuditLogToken => ({
  kind: 'currency',
  amount: amount.toLocaleString(),
  isRobux
});

const formatUrl = (id: number, name: string, type: string): AuditLogToken => {
  switch (type) {
    case 'profile':
      return linkToken(name, formatSeoUrl('users', id, 'profile'));
    case 'universe':
      return linkToken(name, `/universes/configure?id=${id}`);
    case 'create': {
      const seoName = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      return linkToken(
        name,
        `https://create.${EnvironmentUrls.domain}/store/asset/${id}/${seoName}`
      );
    }
    default:
      return linkToken(name, formatSeoUrl(type, id, name));
  }
};

const isUsingDisplayName = (
  description: AuditLogDescription,
  policies?: AuditLogPolicies
): boolean => {
  return Boolean(
    DisplayNames?.Enabled?.() &&
      policies?.useGroupAuditLogDisplayNamesForUser &&
      description.TargetDisplayName
  );
};

const getNameForUser = (description: AuditLogDescription, policies?: AuditLogPolicies): string => {
  if (isUsingDisplayName(description, policies)) {
    return description.TargetDisplayName || '';
  }
  return `@${description.TargetName || ''}`;
};

const getUrlBasedOnAssetType = (description: AuditLogDescription): AuditLogToken => {
  const assetId = description.AssetId || 0;
  const assetName = description.AssetName || '';

  switch (description.AssetType) {
    case 'Place':
      return formatUrl(assetId, assetName, 'games');
    case 'AdsVideo':
    case 'Animation':
    case 'Audio':
    case 'Badge':
    case 'Code':
    case 'Decal':
    case 'GamePass':
    case 'HTML':
    case 'Image':
    case 'LocalizationTableManifest':
    case 'LocalizationTableTranslation':
    case 'Lua':
    case 'Mesh':
    case 'MeshPart':
    case 'Model':
    case 'Plugin':
    case 'SolidModel':
    case 'Text':
    case 'TexturePack':
    case 'Video':
    case 'FontFamily':
      return formatUrl(assetId, assetName, 'create');
    default:
      return formatUrl(assetId, assetName, 'catalog');
  }
};

const rolePositionToken = (roleAboveName?: string): AuditLogToken => {
  if (roleAboveName) {
    return translationToken('Message.UpdateRolesetPositionBelowRole', { roleAboveName });
  }
  return translationToken('Message.UpdateRolesetPositionTopRole');
};

const roleColorLabels = [
  'Default',
  'Blue',
  'Green',
  'Purple',
  'Yellow',
  'Orange',
  'Red',
  'Magenta',
  'Teal',
  'Turquoise',
  'Rust',
  'Pistachio',
  'Midnight',
  'Lavender',
  'Pink',
  'Crimson',
  'Plum'
];

const roleColorTranslationId = (color: number | string | undefined): string => {
  const numericColor = typeof color === 'number' ? color : Number(color);
  return `Label.RoleColor${roleColorLabels[numericColor] || 'Default'}`;
};

const targetUserTokens = (
  description: AuditLogDescription,
  policies?: AuditLogPolicies
): Record<string, AuditLogToken> => ({
  user: formatUrl(description.TargetId || 0, getNameForUser(description, policies), 'profile')
});

const targetGroupTokens = (description: AuditLogDescription): Record<string, AuditLogToken> => ({
  group: formatUrl(description.TargetGroupId || 0, description.TargetGroupName || '', 'groups')
});

const gamePlaceTokens = (description: AuditLogDescription): Record<string, AuditLogToken> => ({
  game: formatUrl(description.AssetId || 0, description.AssetName || '', 'games')
});

const assetItemTokens = (description: AuditLogDescription): Record<string, AuditLogToken> => ({
  item: getUrlBasedOnAssetType(description)
});

const toDescription = (
  messageKey: string,
  tokens: Record<string, AuditLogToken> = {},
  details?: AuditLogDescriptionResult[]
): AuditLogDescriptionResult =>
  details ? { messageKey, tokens, details } : { messageKey, tokens };

export const formatDescription = (
  data: AuditLogEntry,
  policies?: AuditLogPolicies
): AuditLogDescriptionResult | null => {
  const { userId, displayName } = data.actor.user;
  const actor = formatUrl(userId, displayName, 'profile');
  const { description } = data;

  switch (data.actionType) {
    case actionTypes.removeMember:
      return toDescription('Message.RemoveMember', {
        actor,
        ...targetUserTokens(description, policies)
      });

    case actionTypes.banMember:
      return toDescription('Message.BanMember', {
        actor,
        ...targetUserTokens(description, policies)
      });

    case actionTypes.unbanMember:
      return toDescription('Message.UnbanMember', {
        actor,
        ...targetUserTokens(description, policies)
      });

    case actionTypes.deletePost:
      return toDescription('Message.DeletePost', {
        actor,
        ...targetUserTokens(description, policies)
      });

    case actionTypes.acceptJoinRequest:
      return toDescription('Message.AcceptJoinRequest', {
        actor,
        ...targetUserTokens(description, policies)
      });

    case actionTypes.declineJoinRequest:
      return toDescription('Message.DeclineJoinRequest', {
        actor,
        ...targetUserTokens(description, policies)
      });

    case actionTypes.postStatus:
      return toDescription('Message.PostStatus', {
        actor,
        groupStatus: textToken(description.Text || '')
      });

    case actionTypes.changeRank:
      return toDescription('Message.ChangeRank', {
        actor,
        user: formatUrl(description.TargetId || 0, description.TargetName || '', 'profile'),
        oldRoleSet: textToken(description.OldRoleSetName || ''),
        newRoleSet: textToken(description.NewRoleSetName || '')
      });

    case actionTypes.assignRole:
      return toDescription('Message.AssignRole', {
        actor,
        rolesetName: textToken(description.RoleSetName || ''),
        ...targetUserTokens(description, policies)
      });

    case actionTypes.unassignRole:
      return toDescription('Message.UnassignRole', {
        actor,
        rolesetName: textToken(description.RoleSetName || ''),
        ...targetUserTokens(description, policies)
      });

    case actionTypes.buyAd:
      return toDescription('Message.BuyAd', {
        actor,
        bid: currencyToken(description.Bid || 0, description.CurrencyTypeId === currencyType.robux),
        adName: textToken(description.AdName || '')
      });

    case actionTypes.sendAllyRequest:
      return toDescription('Message.SendAllyRequest', { actor, ...targetGroupTokens(description) });

    case actionTypes.createEnemy:
      return toDescription('Message.CreateEnemy', { actor, ...targetGroupTokens(description) });

    case actionTypes.acceptAllyRequest:
      return toDescription('Message.AcceptAllyRequest', {
        actor,
        ...targetGroupTokens(description)
      });

    case actionTypes.declineAllyRequest:
      return toDescription('Message.DeclineAllyRequest', {
        actor,
        ...targetGroupTokens(description)
      });

    case actionTypes.deleteAlly:
      return toDescription('Message.DeleteAlly', { actor, ...targetGroupTokens(description) });

    case actionTypes.deleteEnemy:
      return toDescription('Message.DeleteEnemy', { actor, ...targetGroupTokens(description) });

    case actionTypes.addGroupPlace:
      return toDescription('Message.AddGroupPlace', { actor, ...gamePlaceTokens(description) });

    case actionTypes.deleteGroupPlace:
      return toDescription('Message.DeleteGroupPlace', { actor, ...gamePlaceTokens(description) });

    case actionTypes.savePlace:
      return toDescription('Message.SavePlace', { actor, ...gamePlaceTokens(description) });

    case actionTypes.publishPlace:
      return toDescription('Message.PublishPlace', { actor, ...gamePlaceTokens(description) });

    case actionTypes.createGroupDeveloperSubscriptionProduct:
      return toDescription('Message.CreateGroupDeveloperSubscriptionProduct', {
        actor,
        id: textToken(String(description.ProductId || ''))
      });

    case actionTypes.createItems:
      return toDescription('Message.CreateItems', { actor, ...assetItemTokens(description) });

    case actionTypes.configureItems:
      return toDescription('Message.ConfigureItems', { actor, ...assetItemTokens(description) });

    case actionTypes.changeOwner:
      if (description.NewOwnerId != null) {
        return toDescription('Message.ChangeOwner', {
          actor,
          user: formatUrl(description.NewOwnerId, description.NewOwnerName || '', 'profile')
        });
      }
      return toDescription('Message.ChangeOwnerEmpty');

    case actionTypes.rename:
      return toDescription('Message.Rename', {
        actor,
        newName: textToken(description.NewName || '')
      });

    case actionTypes.delete:
      return toDescription('Message.Delete', { actor });

    case actionTypes.adjustCurrencyAmounts: {
      const amount = currencyToken(
        Math.abs(description.Amount || 0),
        description.CurrencyType === currencyType.robux
      );
      if ((description.Amount || 0) > 0) {
        return toDescription('Message.AdjustCurrencyAmountsIncreased', { actor, amount });
      }
      return toDescription('Message.AdjustCurrencyAmountsDecreased', { actor, amount });
    }

    case actionTypes.abandon:
      return toDescription('Message.Abandon', { actor });

    case actionTypes.claim:
      return toDescription('Message.Claim', { actor });

    case actionTypes.changeDescription:
      return toDescription('Message.ChangeDescription', {
        actor,
        newDescription: textToken(description.NewDescription || '')
      });

    case actionTypes.spendGroupFunds:
      return toDescription('Message.SpendGroupFunds', {
        actor,
        amount: currencyToken(
          description.Amount || 0,
          description.CurrencyTypeId === currencyType.robux
        ),
        item: textToken(description.ItemDescription || '')
      });

    case actionTypes.inviteToClan:
      return toDescription('Message.InviteToClan', {
        actor,
        ...targetUserTokens(description, policies)
      });

    case actionTypes.kickFromClan:
      return toDescription('Message.KickFromClan', {
        actor,
        ...targetUserTokens(description, policies)
      });

    case actionTypes.cancelClanInvite:
      return toDescription('Message.CancelClanInvite', {
        actor,
        ...targetUserTokens(description, policies)
      });

    case actionTypes.buyClan:
      return toDescription('Message.BuyClan', { actor });

    case actionTypes.createAsset:
      return toDescription('Message.CreateAsset', { actor, ...assetItemTokens(description) });

    case actionTypes.updateAsset: {
      const item = getUrlBasedOnAssetType(description);
      if (description.RevertVersionNumber != null) {
        return toDescription('Message.UpdateAssetRevert', {
          actor,
          item,
          version: textToken(String(description.VersionNumber || '')),
          oldVersion: textToken(String(description.RevertVersionNumber))
        });
      }
      return toDescription('Message.UpdateAsset', {
        actor,
        version: textToken(String(description.VersionNumber || '')),
        item
      });
    }

    case actionTypes.configureAsset: {
      let actions = '';
      if (!description.Actions || description.Actions.length === 0) {
        actions = 'configured asset';
      } else {
        description.Actions.forEach(num => {
          actions += configureGroupAssetAction[num] || '';
        });
      }
      return toDescription('Message.ConfigureAsset', {
        actor,
        ...assetItemTokens(description),
        actions: textToken(actions)
      });
    }

    case actionTypes.createDeveloperProduct:
      return toDescription('Message.CreateDeveloperProduct', {
        actor,
        id: textToken(String(description.AssetId || ''))
      });

    case actionTypes.configureGame: {
      let actions = '';
      (description.Actions || []).forEach(num => {
        actions += configureGroupGameAction[num] || '';
      });
      if (description.Type === 1) {
        return toDescription('Message.ConfigureGame', {
          actor,
          game: formatUrl(description.TargetId || 0, description.TargetName || '', 'universe'),
          actions: textToken(actions)
        });
      }
      return toDescription('Message.ConfigureGameDeveloperProduct', {
        actor,
        id: textToken(String(description.TargetId || '')),
        actions: textToken(actions)
      });
    }

    case actionTypes.lock:
      return toDescription('Message.Lock', { actor });

    case actionTypes.unlock:
      return toDescription('Message.Unlock', { actor });

    case actionTypes.createGamePass:
      return toDescription('Message.CreateGamePass', {
        actor,
        game: formatUrl(description.PlaceId || 0, description.PlaceName || '', 'games'),
        gamePass: formatUrl(
          description.GamePassId || 0,
          description.GamePassName || '',
          'game-pass'
        )
      });

    case actionTypes.createBadge:
      return toDescription('Message.CreateBadge', {
        actor,
        badge: formatUrl(description.BadgeId || 0, description.BadgeName || '', 'badges')
      });

    case actionTypes.configureBadge: {
      const badge = formatUrl(description.BadgeId || 0, description.BadgeName || '', 'badges');
      switch (description.Type) {
        case groupBadgeAuditType.enabledBadge:
          return toDescription('Message.ConfigureBadgeEnabled', { actor, badge });
        case groupBadgeAuditType.disabledBadge:
          return toDescription('Message.ConfigureBadgeDisabled', { actor, badge });
        case groupBadgeAuditType.updatedBadgeNameDescription:
          return toDescription('Message.ConfigureBadgeUpdate', { actor, badge });
        default:
          return null;
      }
    }

    case actionTypes.updateRolesetRank:
      return toDescription('Message.UpdateRolesetRank', {
        actor,
        roleSetName: textToken(description.RoleSetName || ''),
        oldRank: textToken(String(description.OldRank || '')),
        newRank: textToken(String(description.NewRank || ''))
      });

    case actionTypes.updateRolesetData: {
      const details: AuditLogDescriptionResult[] = [];
      if (description.OldName !== description.NewName) {
        details.push(
          toDescription('Message.UpdateRolesetPropertiesName', {
            newName: textToken(description.NewName || '')
          })
        );
      }
      if (description.OldDescription !== description.NewDescription) {
        details.push(
          toDescription('Message.UpdateRolesetPropertiesDescription', {
            newDescription: textToken(description.NewDescription || '')
          })
        );
      }
      if (description.OldColor !== description.NewColor) {
        details.push(
          toDescription('Message.UpdateRolesetPropertiesColor', {
            newColor: translationListToken([roleColorTranslationId(description.NewColor)])
          })
        );
      }
      if (description.OldIsPrivate !== description.NewIsPrivate) {
        details.push(
          toDescription(
            description.NewIsPrivate
              ? 'Message.UpdateRolesetPropertiesVisibilityPrivate'
              : 'Message.UpdateRolesetPropertiesVisibilityPublic'
          )
        );
      }
      return toDescription(
        'Message.UpdateRolesetProperties',
        {
          actor,
          roleSetName: textToken(description.RoleSetName || '')
        },
        details.length > 0 ? details : undefined
      );
    }

    case actionTypes.createForumCategory:
      return toDescription('Message.CreateForumCategory', {
        actor,
        category: textToken(description.CategoryName || '')
      });

    case actionTypes.updateForumCategory:
      return toDescription('Message.UpdateForumCategory', {
        actor,
        oldName: textToken(description.OldName || ''),
        newName: textToken(description.NewName || '')
      });

    case actionTypes.archiveForumCategory:
      return toDescription(
        description.IsArchived ? 'Message.ArchiveForumCategory' : 'Message.UnarchiveForumCategory',
        { actor, category: textToken(description.CategoryName || '') }
      );

    case actionTypes.deleteForumCategory:
      return toDescription('Message.DeleteForumCategory', {
        actor,
        category: textToken(description.CategoryName || '')
      });

    case actionTypes.deleteForumPost:
      return toDescription('Message.DeleteForumPost', {
        actor,
        ...targetUserTokens(description, policies)
      });

    case actionTypes.deleteForumComment:
      return toDescription('Message.DeleteForumComment', {
        actor,
        ...targetUserTokens(description, policies)
      });

    case actionTypes.createRoleset:
      return toDescription('Message.CreateRolesetLog', {
        actor,
        rolesetName: textToken(description.RoleSetName || '')
      });

    case actionTypes.deleteRoleset:
      return toDescription('Message.DeleteRolesetLog', {
        actor,
        rolesetName: textToken(description.RoleSetName || '')
      });

    case actionTypes.createCommerceProduct:
      return toDescription('Message.CreateCommerceProduct', {
        actor,
        id: textToken(String(description.CommerceProductId || ''))
      });

    case actionTypes.setCommerceProductActive:
      return toDescription('Message.SetCommerceProductActive', {
        actor,
        id: textToken(String(description.CommerceProductId || ''))
      });

    case actionTypes.archiveCommerceProduct:
      return toDescription('Message.ArchiveCommerceProduct', {
        actor,
        id: textToken(String(description.CommerceProductId || ''))
      });

    case actionTypes.acceptCommerceProductBundlingFee:
      return toDescription('Message.AcceptCommerceProductBundlingFee', {
        actor,
        id: textToken(String(description.CommerceProductId || ''))
      });

    case actionTypes.setCommerceProductInactive:
      return toDescription('Message.SetCommerceProductInactive', {
        actor,
        id: textToken(String(description.CommerceProductId || ''))
      });

    case actionTypes.rejectCommerceProductBundlingFee:
      return toDescription('Message.RejectCommerceProductBundlingFee', {
        actor,
        id: textToken(String(description.CommerceProductId || ''))
      });

    case actionTypes.connectMerchant:
      if (description.MerchantType === merchantType.shopify) {
        return toDescription('Message.ConnectShopifyStore', {
          actor,
          shopifyShopDomain: textToken(description.MerchantId || '')
        });
      }
      return null;

    case actionTypes.disconnectMerchant:
      if (description.MerchantType === merchantType.shopify) {
        return toDescription('Message.DisconnectShopifyStore', {
          actor,
          shopifyShopDomain: textToken(description.MerchantId || '')
        });
      }
      return null;

    case actionTypes.lockForumPost:
      return toDescription('Message.LockForumPost', {
        actor,
        ...targetUserTokens(description, policies)
      });

    case actionTypes.unlockForumPost:
      return toDescription('Message.UnlockForumPost', {
        actor,
        ...targetUserTokens(description, policies)
      });

    case actionTypes.pinForumPost:
      return toDescription('Message.PinForumPost', {
        actor,
        ...targetUserTokens(description, policies)
      });

    case actionTypes.unpinForumPost:
      return toDescription('Message.UnpinForumPost', {
        actor,
        ...targetUserTokens(description, policies)
      });

    case actionTypes.joinGroup:
      return toDescription('Message.JoinGroup', { actor });

    case actionTypes.leaveGroup:
      return toDescription('Message.LeaveGroup', { actor });

    case actionTypes.updateGroupIcon:
      return toDescription('Message.UpdateGroupIcon', { actor });

    case actionTypes.updateGroupCoverPhoto:
      return toDescription('Message.UpdateCoverPhoto', { actor });

    case actionTypes.updateGroupSecuritySettings:
      switch (description.SecuritySettingType) {
        case securitySettingType.verificationLevel:
          return toDescription('Message.UpdateSecuritySettingsVerificationLevel', { actor });
        case securitySettingType.accountTenureRequirement:
          return toDescription('Message.UpdateSecuritySettingsAccountTenure', { actor });
        case securitySettingType.slowmode:
          return toDescription('Message.UpdateSecuritySettingsSlowmode', { actor });
        case securitySettingType.memberListVisibility:
          return toDescription('Message.UpdateSecuritySettingsMemberListVisibility', { actor });
        default:
          return null;
      }

    case actionTypes.publishAnnouncement:
      return toDescription('Message.CreatedAnnouncement', {
        actor,
        title: textToken(description.Title || '')
      });

    case actionTypes.deleteAnnouncement:
      return toDescription('Message.DeletedAnnouncement', {
        actor,
        title: textToken(description.Title || '')
      });

    case actionTypes.updateRoleSetPermissions:
      return toDescription(
        'Message.UpdateRolesetPermissions',
        {
          actor,
          rolesetName: textToken(description.RoleSetName || ''),
          entityType: textToken(description.EntityType?.toLowerCase() || ''),
          entityName: textToken(description.EntityName || '')
        },
        [
          ...(description.AddedPermissions?.length
            ? [
                toDescription('Message.UpdateRoleSetPermissionsAdded', {
                  addedPermissions: translationListToken(
                    description.AddedPermissions.map(permission => `${permission}.Label`)
                  )
                })
              ]
            : []),
          ...(description.RemovedPermissions?.length
            ? [
                toDescription('Message.UpdateRoleSetPermissionsRemoved', {
                  removedPermissions: translationListToken(
                    description.RemovedPermissions.map(permission => `${permission}.Label`)
                  )
                })
              ]
            : [])
        ]
      );

    case actionTypes.updateRoleSetPosition:
      return toDescription('Message.UpdateRolesetPosition', {
        actor,
        roleSetName: textToken(description.RoleSetName || ''),
        oldPosition: rolePositionToken(description.OldRoleAboveName),
        newPosition: rolePositionToken(description.NewRoleAboveName)
      });

    // Granting and revoking Enterprise carries no detail beyond who did it: the
    // tier is assigned wholesale by Roblox staff, and the payload's `description`
    // is an empty object.
    case actionTypes.grantEnterpriseTier:
      return toDescription('Message.GrantEnterpriseTier', { actor });

    case actionTypes.revokeEnterpriseTier:
      return toDescription('Message.RevokeEnterpriseTier', { actor });

    default:
      return null;
  }
};

export const getAuditLog = async ({
  groupId,
  actionType,
  userId,
  cursor,
  limit = loadPageSize,
  sortOrder = 'Desc'
}: GetAuditLogParams): Promise<AuditLogResponse> => {
  const params: Record<string, string | number> = {
    limit,
    sortOrder
  };

  if (actionType && actionType !== 'all') {
    params.actionType = actionType;
  }

  if (userId) {
    params.userId = userId;
  }

  if (cursor) {
    params.cursor = cursor;
  }

  const response = await httpService.get<AuditLogResponse>(
    { url: urls.getAuditLogUrl(groupId), withCredentials: true },
    params
  );

  return response.data;
};

export const getUserIdFromUsername = async (username: string): Promise<number | null> => {
  if (!username.trim()) {
    return null;
  }

  try {
    const response = await httpService.post<UserIdLookupResponse>(
      { url: groupConstants.urls.getUsersFromUsernamesURL, withCredentials: true },
      { usernames: [username], excludeBannedUsers: false }
    );

    if (response.data.data.length > 0) {
      return response.data.data[0].id;
    }
    return null;
  } catch {
    return null;
  }
};

export default {
  getAuditLog,
  getUserIdFromUsername,
  formatDescription
};
