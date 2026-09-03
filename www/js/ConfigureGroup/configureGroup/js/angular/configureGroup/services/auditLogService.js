import { EnvironmentUrls } from 'Roblox';
import { concatTexts, seoName } from 'core-utilities';

import configureGroupModule from '../configureGroupModule';

function auditLogService(
  auditLogConstants,
  languageResource,
  $filter,
  configureGroupUtilityService,
  groupsConstants
) {
  'ngInject';

  function isUsingDisplayName(description, policies) {
    return policies?.useGroupAuditLogDisplayNamesForUser && description.TargetDisplayName;
  }

  function formatUrl(id, name, type) {
    switch (type) {
      case 'profile': {
        return `<a class="text-link" href="${$filter('seoUrl')('users', id, 'profile')}">${$filter(
          'escapeHtml'
        )(name)}</a>`;
      }
      case 'universe':
        return `<a class="text-link" href="/universes/configure?id=${id}">${$filter('escapeHtml')(
          name
        )}</a>`;
      case 'create': {
        const seoNamePart = seoName.formatSeoName(name);
        const url = `https://create.${EnvironmentUrls.domain}/store/asset/${id}/${seoNamePart}`;
        return `<a class="text-link" href="${url}">${$filter('escapeHtml')(name)}</a>`;
      }
      case 'games':
      case 'catalog':
      case 'groups':
      case 'game-pass':
      case 'badges':
      default:
        return `<a class="text-link" href="${$filter('seoUrl')(type, id, name)}">${$filter(
          'escapeHtml'
        )(name)}</a>`;
    }
  }

  function pickUpdateRoleSetDataText(oldName, newName, oldDescription, newDescription) {
    if (oldDescription === newDescription) {
      return 'Message.UpdateRolesetDataNameOnly';
    }
    if (oldName === newName) {
      return 'Message.UpdateRolesetDataDescOnly';
    }
    return 'Message.UpdateRolesetData';
  }

  function pickArchiveForumCategoryText(isArchived) {
    return isArchived ? 'Message.ArchiveForumCategory' : 'Message.UnarchiveForumCategory';
  }

  function getNameForUser(description, policies) {
    if (isUsingDisplayName(description, policies)) {
      return description.TargetDisplayName;
    }

    // Add @ prefix for usernames (but not display names)
    return concatTexts.concat(['', description.TargetName]);
  }

  function getURLBasedOnAssetType(data) {
    const assetId = data.description.AssetId;
    const assetName = data.description.AssetName;
    const assetType = data.description.AssetType;

    // Handle special cases for different asset types
    switch (assetType) {
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
  }

  function formatDescription(data, policies) {
    const currentUser = data.actor.user;
    const { userId, displayName } = currentUser;
    const nameForDisplay = displayName;
    const actorUrl = `<a class="text-link" href="${$filter('seoUrl')(
      'users',
      userId,
      'profile'
    )}">${$filter('escapeHtml')(nameForDisplay)}</a>`;
    const { robuxIconHtml } = groupsConstants;
    const { actionTypes } = auditLogConstants;
    data.actor.user = configureGroupUtilityService.getNameForDisplay(currentUser);

    switch (data.actionType) {
      case actionTypes.removeMember: {
        return languageResource.get('Message.RemoveMember', {
          actor: actorUrl,
          user: formatUrl(
            data.description.TargetId,
            getNameForUser(data.description, policies),
            'profile'
          )
        });
      }
      case actionTypes.banMember: {
        return languageResource.get('Message.BanMember', {
          actor: actorUrl,
          user: formatUrl(
            data.description.TargetId,
            getNameForUser(data.description, policies),
            'profile'
          )
        });
      }
      case actionTypes.unbanMember: {
        return languageResource.get('Message.UnbanMember', {
          actor: actorUrl,
          user: formatUrl(
            data.description.TargetId,
            getNameForUser(data.description, policies),
            'profile'
          )
        });
      }
      case actionTypes.deletePost: {
        return languageResource.get('Message.DeletePost', {
          actor: actorUrl,
          user: formatUrl(
            data.description.TargetId,
            getNameForUser(data.description, policies),
            'profile'
          )
        });
      }
      case actionTypes.acceptJoinRequest: {
        return languageResource.get('Message.AcceptJoinRequest', {
          actor: actorUrl,
          user: formatUrl(
            data.description.TargetId,
            getNameForUser(data.description, policies),
            'profile'
          )
        });
      }
      case actionTypes.declineJoinRequest: {
        return languageResource.get('Message.DeclineJoinRequest', {
          actor: actorUrl,
          user: formatUrl(
            data.description.TargetId,
            getNameForUser(data.description, policies),
            'profile'
          )
        });
      }
      case actionTypes.postStatus: {
        return languageResource.get('Message.PostStatus', {
          actor: actorUrl,
          groupStatus: $filter('escapeHtml')(data.description.Text)
        });
      }
      case actionTypes.changeRank: {
        return languageResource.get('Message.ChangeRank', {
          actor: actorUrl,
          user: formatUrl(data.description.TargetId, data.description.TargetName, 'profile'),
          oldRoleSet: $filter('escapeHtml')(data.description.OldRoleSetName),
          newRoleSet: $filter('escapeHtml')(data.description.NewRoleSetName)
        });
      }
      case actionTypes.assignRole: {
        return languageResource.get('Message.AssignRole', {
          actor: actorUrl,
          rolesetName: $filter('escapeHtml')(data.description.RoleSetName),
          user: formatUrl(
            data.description.TargetId,
            getNameForUser(data.description, policies),
            'profile'
          )
        });
      }
      case actionTypes.unassignRole: {
        return languageResource.get('Message.UnassignRole', {
          actor: actorUrl,
          rolesetName: $filter('escapeHtml')(data.description.RoleSetName),
          user: formatUrl(
            data.description.TargetId,
            getNameForUser(data.description, policies),
            'profile'
          )
        });
      }
      case actionTypes.buyAd: {
        return languageResource.get('Message.BuyAd', {
          actor: actorUrl,
          bid:
            data.description.CurrencyTypeId === auditLogConstants.currencyType.robux
              ? `${robuxIconHtml}${$filter('number')(data.description.Bid)}`
              : `${$filter('number')(data.description.Bid)} tickets`,
          adName: $filter('escapeHtml')(data.description.AdName)
        });
      }
      case actionTypes.sendAllyRequest: {
        return languageResource.get('Message.SendAllyRequest', {
          actor: actorUrl,
          group: formatUrl(
            data.description.TargetGroupId,
            data.description.TargetGroupName,
            'groups'
          )
        });
      }
      case actionTypes.createEnemy: {
        return languageResource.get('Message.CreateEnemy', {
          actor: actorUrl,
          group: formatUrl(
            data.description.TargetGroupId,
            data.description.TargetGroupName,
            'groups'
          )
        });
      }
      case actionTypes.acceptAllyRequest: {
        return languageResource.get('Message.AcceptAllyRequest', {
          actor: actorUrl,
          group: formatUrl(
            data.description.TargetGroupId,
            data.description.TargetGroupName,
            'groups'
          )
        });
      }
      case actionTypes.declineAllyRequest: {
        return languageResource.get('Message.DeclineAllyRequest', {
          actor: actorUrl,
          group: formatUrl(
            data.description.TargetGroupId,
            data.description.TargetGroupName,
            'groups'
          )
        });
      }
      case actionTypes.deleteAlly: {
        return languageResource.get('Message.DeleteAlly', {
          actor: actorUrl,
          group: formatUrl(
            data.description.TargetGroupId,
            data.description.TargetGroupName,
            'groups'
          )
        });
      }
      case actionTypes.deleteEnemy: {
        return languageResource.get('Message.DeleteEnemy', {
          actor: actorUrl,
          group: formatUrl(
            data.description.TargetGroupId,
            data.description.TargetGroupName,
            'groups'
          )
        });
      }
      case actionTypes.addGroupPlace: {
        return languageResource.get('Message.AddGroupPlace', {
          actor: actorUrl,
          game: formatUrl(data.description.AssetId, data.description.AssetName, 'games')
        });
      }
      case actionTypes.deleteGroupPlace: {
        return languageResource.get('Message.DeleteGroupPlace', {
          actor: actorUrl,
          game: formatUrl(data.description.AssetId, data.description.AssetName, 'games')
        });
      }
      case actionTypes.savePlace: {
        return languageResource.get('Message.SavePlace', {
          actor: actorUrl,
          game: formatUrl(data.description.AssetId, data.description.AssetName, 'games')
        });
      }
      case actionTypes.publishPlace: {
        return languageResource.get('Message.PublishPlace', {
          actor: actorUrl,
          game: formatUrl(data.description.AssetId, data.description.AssetName, 'games')
        });
      }
      case actionTypes.createGroupDeveloperSubscriptionProduct: {
        return languageResource.get('Message.CreateGroupDeveloperSubscriptionProduct', {
          actor: actorUrl,
          id: data.description.ProductId
        });
      }
      case actionTypes.createItems: {
        let itemUrl = getURLBasedOnAssetType(data);

        return languageResource.get('Message.CreateItems', {
          actor: actorUrl,
          item: itemUrl
        });
      }
      case actionTypes.configureItems: {
        let itemUrl = getURLBasedOnAssetType(data);

        return languageResource.get('Message.ConfigureItems', {
          actor: actorUrl,
          item: itemUrl
        });
      }
      case actionTypes.changeOwner: {
        if (data.description.NewOwnerId != null) {
          return languageResource.get('Message.ChangeOwner', {
            actor: actorUrl,
            user: formatUrl(data.description.NewOwnerId, data.description.NewOwnerName, 'profile')
          });
        }
        return languageResource.get('Message.ChangeOwnerEmpty');
      }
      case actionTypes.rename: {
        return languageResource.get('Message.Rename', {
          actor: actorUrl,
          newName: $filter('escapeHtml')(data.description.NewName)
        });
      }
      case actionTypes.delete: {
        return languageResource.get('Message.Delete', {
          actor: actorUrl
        });
      }
      case actionTypes.adjustCurrencyAmounts: {
        if (data.description.Amount > 0) {
          return languageResource.get('Message.AdjustCurrencyAmountsIncreased', {
            actor: actorUrl,
            amount:
              data.description.CurrencyType === auditLogConstants.currencyType.robux
                ? `${robuxIconHtml}${$filter('number')(Math.abs(data.description.Amount))}`
                : `${$filter('number')(Math.abs(data.description.Amount))} tickets`
          });
        }
        return languageResource.get('Message.AdjustCurrencyAmountsDecreased', {
          actor: actorUrl,
          amount:
            data.description.CurrencyType === auditLogConstants.currencyType.robux
              ? `${robuxIconHtml}${$filter('number')(Math.abs(data.description.Amount))}`
              : `${$filter('number')(Math.abs(data.description.Amount))} tickets`
        });
      }
      case actionTypes.abandon: {
        return languageResource.get('Message.Abandon', {
          actor: actorUrl
        });
      }
      case actionTypes.claim: {
        return languageResource.get('Message.Claim', {
          actor: actorUrl
        });
      }
      case actionTypes.changeDescription: {
        return languageResource.get('Message.ChangeDescription', {
          actor: actorUrl,
          newDescription: $filter('escapeHtml')(data.description.NewDescription)
        });
      }
      case actionTypes.spendGroupFunds: {
        return languageResource.get('Message.SpendGroupFunds', {
          actor: actorUrl,
          amount:
            data.description.CurrencyTypeId === auditLogConstants.currencyType.robux
              ? `${robuxIconHtml}${$filter('number')(data.description.Amount)}`
              : `${$filter('number')(data.description.Amount)} tickets`,
          item: $filter('escapeHtml')(data.description.ItemDescription)
        });
      }
      case actionTypes.inviteToClan: {
        return languageResource.get('Message.InviteToClan', {
          actor: actorUrl,
          user: formatUrl(
            data.description.TargetId,
            getNameForUser(data.description, policies),
            'profile'
          )
        });
      }
      case actionTypes.kickFromClan: {
        return languageResource.get('Message.KickFromClan', {
          actor: actorUrl,
          user: formatUrl(
            data.description.TargetId,
            getNameForUser(data.description, policies),
            'profile'
          )
        });
      }
      case actionTypes.cancelClanInvite: {
        return languageResource.get('Message.CancelClanInvite', {
          actor: actorUrl,
          user: formatUrl(
            data.description.TargetId,
            getNameForUser(data.description, policies),
            'profile'
          )
        });
      }
      case actionTypes.buyClan: {
        return languageResource.get('Message.BuyClan', {
          actor: actorUrl
        });
      }
      case actionTypes.createAsset: {
        let itemUrl = getURLBasedOnAssetType(data);

        return languageResource.get('Message.CreateAsset', {
          actor: actorUrl,
          item: itemUrl
        });
      }
      case actionTypes.updateAsset: {
        let itemUrl = getURLBasedOnAssetType(data);

        if (data.description.RevertVersionNumber != null) {
          return languageResource.get('Message.UpdateAssetRevert', {
            actor: actorUrl,
            item: itemUrl,
            version: data.description.VersionNumber,
            oldVersion: data.description.RevertVersionNumber
          });
        }
        return languageResource.get('Message.UpdateAsset', {
          actor: actorUrl,
          version: data.description.VersionNumber,
          item: itemUrl
        });
      }
      case actionTypes.configureAsset: {
        var actions = '';
        if (data.description.Actions == null || data.description.Actions.length === 0) {
          actions = 'configured asset';
        } else {
          data.description.Actions.forEach(function (num) {
            actions += auditLogConstants.configureGroupAssetAction[num];
          });
        }
        let itemUrl = getURLBasedOnAssetType(data);

        return languageResource.get('Message.ConfigureAsset', {
          actor: actorUrl,
          item: itemUrl,
          actions
        });
      }
      case actionTypes.createDeveloperProduct: {
        return languageResource.get('Message.CreateDeveloperProduct', {
          actor: actorUrl,
          id: data.description.AssetId
        });
      }
      case actionTypes.configureGame: {
        var actions = '';
        data.description.Actions.forEach(function (num) {
          actions += auditLogConstants.configureGroupGameAction[num];
        });
        if (data.description.Type === 1) {
          const gameUrl = formatUrl(
            data.description.TargetId,
            data.description.TargetName,
            'universe'
          );
          return languageResource.get('Message.ConfigureGame', {
            actor: actorUrl,
            game: gameUrl,
            actions
          });
        }
        return languageResource.get('Message.ConfigureGameDeveloperProduct', {
          actor: actorUrl,
          id: data.description.TargetId,
          actions
        });
      }
      case actionTypes.lock: {
        return languageResource.get('Message.Lock', {
          actor: actorUrl
        });
      }
      case actionTypes.unlock: {
        return languageResource.get('Message.Unlock', {
          actor: actorUrl
        });
      }
      case actionTypes.createGamePass: {
        return languageResource.get('Message.CreateGamePass', {
          actor: actorUrl,
          game: formatUrl(data.description.PlaceId, data.description.PlaceName, 'games'),
          gamePass: formatUrl(
            data.description.GamePassId,
            data.description.GamePassName,
            'game-pass'
          )
        });
      }
      case actionTypes.createBadge: {
        var badgeLink = formatUrl(data.description.BadgeId, data.description.BadgeName, 'badges');
        return languageResource.get('Message.CreateBadge', {
          actor: actorUrl,
          badge: badgeLink
        });
      }
      case actionTypes.configureBadge: {
        var badgeLink = formatUrl(data.description.BadgeId, data.description.BadgeName, 'badges');
        switch (data.description.Type) {
          case auditLogConstants.groupBadgeAuditType.enabledBadge:
            return languageResource.get('Message.ConfigureBadgeEnabled', {
              actor: actorUrl,
              badge: badgeLink
            });
          case auditLogConstants.groupBadgeAuditType.disabledBadge:
            return languageResource.get('Message.ConfigureBadgeDisabled', {
              actor: actorUrl,
              badge: badgeLink
            });
          case auditLogConstants.groupBadgeAuditType.updatedBadgeNameDescription:
            return languageResource.get('Message.ConfigureBadgeUpdate', {
              actor: actorUrl,
              badge: badgeLink
            });
        }
        break;
      }
      case actionTypes.updateRolesetRank: {
        return languageResource.get('Message.UpdateRolesetRank', {
          actor: actorUrl,
          roleSetName: $filter('escapeHtml')(data.description.RoleSetName),
          oldRank: data.description.OldRank,
          newRank: data.description.NewRank
        });
      }
      case actionTypes.updateRolesetData: {
        const textLabel = pickUpdateRoleSetDataText(
          data.description.OldName,
          data.description.NewName,
          data.description.OldDescription,
          data.description.NewDescription
        );
        return languageResource.get(textLabel, {
          actor: actorUrl,
          oldName: $filter('escapeHtml')(data.description.OldName),
          newName: $filter('escapeHtml')(data.description.NewName),
          oldDescription: $filter('escapeHtml')(data.description.OldDescription),
          newDescription: $filter('escapeHtml')(data.description.NewDescription)
        });
      }
      case actionTypes.createForumCategory: {
        return languageResource.get('Message.CreateForumCategory', {
          actor: actorUrl,
          category: $filter('escapeHtml')(data.description.CategoryName)
        });
      }
      case actionTypes.updateForumCategory: {
        return languageResource.get('Message.UpdateForumCategory', {
          actor: actorUrl,
          oldName: $filter('escapeHtml')(data.description.OldName),
          newName: $filter('escapeHtml')(data.description.NewName)
        });
      }
      case actionTypes.archiveForumCategory: {
        const archiveMessage = pickArchiveForumCategoryText(data.description.IsArchived);
        return languageResource.get(archiveMessage, {
          actor: actorUrl,
          category: $filter('escapeHtml')(data.description.CategoryName)
        });
      }
      case actionTypes.deleteForumCategory: {
        return languageResource.get('Message.DeleteForumCategory', {
          actor: actorUrl,
          category: $filter('escapeHtml')(data.description.CategoryName)
        });
      }
      case actionTypes.deleteForumPost: {
        return languageResource.get('Message.DeleteForumPost', {
          actor: actorUrl,
          user: formatUrl(
            data.description.TargetId,
            getNameForUser(data.description, policies),
            'profile'
          )
        });
      }
      case actionTypes.deleteForumComment: {
        return languageResource.get('Message.DeleteForumComment', {
          actor: actorUrl,
          user: formatUrl(
            data.description.TargetId,
            getNameForUser(data.description, policies),
            'profile'
          )
        });
      }
      case actionTypes.createRoleset: {
        return languageResource.get('Message.CreateRolesetLog', {
          actor: actorUrl,
          rolesetName: $filter('escapeHtml')(data.description.RoleSetName)
        });
      }
      case actionTypes.deleteRoleset: {
        return languageResource.get('Message.DeleteRolesetLog', {
          actor: actorUrl,
          rolesetName: $filter('escapeHtml')(data.description.RoleSetName)
        });
      }
      case actionTypes.createCommerceProduct: {
        return languageResource.get('Message.CreateCommerceProduct', {
          actor: actorUrl,
          id: data.description.CommerceProductId
        });
      }
      case actionTypes.setCommerceProductActive: {
        return languageResource.get('Message.SetCommerceProductActive', {
          actor: actorUrl,
          id: data.description.CommerceProductId
        });
      }
      case actionTypes.archiveCommerceProduct: {
        return languageResource.get('Message.ArchiveCommerceProduct', {
          actor: actorUrl,
          id: data.description.CommerceProductId
        });
      }
      case actionTypes.acceptCommerceProductBundlingFee: {
        return languageResource.get('Message.AcceptCommerceProductBundlingFee', {
          actor: actorUrl,
          id: data.description.CommerceProductId
        });
      }
      case actionTypes.setCommerceProductInactive: {
        return languageResource.get('Message.SetCommerceProductInactive', {
          actor: actorUrl,
          id: data.description.CommerceProductId
        });
      }
      case actionTypes.rejectCommerceProductBundlingFee: {
        return languageResource.get('Message.RejectCommerceProductBundlingFee', {
          actor: actorUrl,
          id: data.description.CommerceProductId
        });
      }
      case actionTypes.connectMerchant: {
        switch (data.description.MerchantType) {
          case auditLogConstants.merchantType.shopify:
            return languageResource.get('Message.ConnectShopifyStore', {
              actor: actorUrl,
              shopifyShopDomain: data.description.MerchantId
            });
        }
      }
      case actionTypes.disconnectMerchant: {
        switch (data.description.MerchantType) {
          case auditLogConstants.merchantType.shopify:
            return languageResource.get('Message.DisconnectShopifyStore', {
              actor: actorUrl,
              shopifyShopDomain: data.description.MerchantId
            });
        }
      }
      case actionTypes.lockForumPost: {
        return languageResource.get('Message.LockForumPost', {
          actor: actorUrl,
          user: formatUrl(
            data.description.TargetId,
            getNameForUser(data.description, policies),
            'profile'
          )
        });
      }
      case actionTypes.unlockForumPost: {
        return languageResource.get('Message.UnlockForumPost', {
          actor: actorUrl,
          user: formatUrl(
            data.description.TargetId,
            getNameForUser(data.description, policies),
            'profile'
          )
        });
      }
      case actionTypes.pinForumPost: {
        return languageResource.get('Message.PinForumPost', {
          actor: actorUrl,
          user: formatUrl(
            data.description.TargetId,
            getNameForUser(data.description, policies),
            'profile'
          )
        });
      }
      case actionTypes.unpinForumPost: {
        return languageResource.get('Message.UnpinForumPost', {
          actor: actorUrl,
          user: formatUrl(
            data.description.TargetId,
            getNameForUser(data.description, policies),
            'profile'
          )
        });
      }
      case actionTypes.joinGroup: {
        return languageResource.get('Message.JoinGroup', {
          actor: actorUrl
        });
      }
      case actionTypes.leaveGroup: {
        return languageResource.get('Message.LeaveGroup', {
          actor: actorUrl
        });
      }
      case actionTypes.updateGroupIcon: {
        return languageResource.get('Message.UpdateGroupIcon', {
          actor: actorUrl
        });
      }
      case actionTypes.updateGroupCoverPhoto: {
        return languageResource.get('Message.UpdateCoverPhoto', {
          actor: actorUrl
        });
      }
      case actionTypes.updateGroupSecuritySettings: {
        switch (data.description.SecuritySettingType) {
          case auditLogConstants.securitySettingType.verificationLevel:
            return languageResource.get('Message.UpdateSecuritySettingsVerificationLevel', {
              actor: actorUrl
            });
          case auditLogConstants.securitySettingType.accountTenureRequirement:
            return languageResource.get('Message.UpdateSecuritySettingsAccountTenure', {
              actor: actorUrl
            });
          case auditLogConstants.securitySettingType.slowmode:
            return languageResource.get('Message.UpdateSecuritySettingsSlowmode', {
              actor: actorUrl
            });
          case auditLogConstants.securitySettingType.memberListVisibility:
            return languageResource.get('Message.UpdateSecuritySettingsMemberListVisibility', {
              actor: actorUrl
            });
          default:
            return '';
        }
      }
      case actionTypes.publishAnnouncement: {
        return languageResource.get('Message.CreatedAnnouncement', {
          actor: actorUrl,
          title: $filter('escapeHtml')(data.description.Title)
        });
      }
      case actionTypes.deleteAnnouncement: {
        return languageResource.get('Message.DeletedAnnouncement', {
          actor: actorUrl,
          title: $filter('escapeHtml')(data.description.Title)
        });
      }
    }
  }

  return {
    formatDescription
  };
}

configureGroupModule.factory('auditLogService', auditLogService);
export default auditLogService;
