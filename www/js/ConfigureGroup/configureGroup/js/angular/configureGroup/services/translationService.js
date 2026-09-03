import configureGroupModule from '../configureGroupModule';

function translationService($q, languageResource) {
  'ngInject';

  const resources = {
    // Audit log Action Types
    all: languageResource.get('Label.All'),
    deletePost: languageResource.get('Label.DeletePost'),
    removeMember: languageResource.get('Label.RemoveMember'),
    banMember: languageResource.get('Label.BanMember'),
    unbanMember: languageResource.get('Label.UnbanUser'),
    acceptJoinRequest: languageResource.get('Label.AcceptJoinRequest'),
    declineJoinRequest: languageResource.get('Label.DeclineJoinRequest'),
    postStatus: languageResource.get('Label.PostStatus'),
    changeRank: languageResource.get('Label.ChangeRank'),
    assignRole: languageResource.get('Label.AssignRole'),
    unassignRole: languageResource.get('Label.UnassignRole'),
    buyAd: languageResource.get('Label.BuyAd'),
    sendAllyRequest: languageResource.get('Label.SendAllyRequest'),
    createEnemy: languageResource.get('Label.CreateEnemy'),
    acceptAllyRequest: languageResource.get('Label.AcceptAllyRequest'),
    declineAllyRequest: languageResource.get('Label.DeclineAllyRequest'),
    deleteAlly: languageResource.get('Label.DeleteAlly'),
    deleteEnemy: languageResource.get('Label.DeleteEnemy'),
    addGroupPlace: languageResource.get('Label.AddGroupPlace'),
    removeGroupPlace: languageResource.get('Label.DeleteGroupPlace'),
    createItems: languageResource.get('Label.CreateItems'),
    configureItems: languageResource.get('Label.ConfigureItems'),
    spendGroupFunds: languageResource.get('Label.SpendGroupFunds'),
    changeOwner: languageResource.get('Label.ChangeOwner'),
    delete: languageResource.get('Label.Delete'),
    adjustCurrencyAmounts: languageResource.get('Label.AdjustCurrencyAmounts'),
    abandon: languageResource.get('Label.Abandon'),
    claim: languageResource.get('Label.Claim'),
    rename: languageResource.get('Label.Rename'),
    changeDescription: languageResource.get('Label.ChangeDescription'),
    createGroupAsset: languageResource.get('Label.CreateGroupAsset'),
    updateGroupAsset: languageResource.get('Label.UpdateGroupAsset'),
    configureGroupAsset: languageResource.get('Label.ConfigureGroupAsset'),
    revertGroupAsset: languageResource.get('Label.RevertGroupAsset'),
    createGroupDeveloperProduct: languageResource.get('Label.CreateGroupDeveloperProduct'),
    createGroupDeveloperSubscriptionProduct: languageResource.get(
      'Label.CreateGroupDeveloperSubscriptionProduct'
    ),
    configureGroupGame: languageResource.get('Label.ConfigureGroupGame'),
    lock: languageResource.get('Label.Lock'),
    unlock: languageResource.get('Label.Unlock'),
    createGamePass: languageResource.get('Label.CreateGamePass'),
    createBadge: languageResource.get('Label.CreateBadge'),
    configureBadge: languageResource.get('Label.ConfigureBadge'),
    savePlace: languageResource.get('Label.SavePlace'),
    publishPlace: languageResource.get('Label.PublishPlace'),
    inviteToClan: languageResource.get('Label.InviteToClan'),
    kickFromClan: languageResource.get('Label.KickFromClan'),
    cancelClanInvite: languageResource.get('Label.CancelClanInvite'),
    buyClan: languageResource.get('Label.BuyClan'),
    changeName: languageResource.get('Label.ChangeName'),
    deleteForumCategory: languageResource.get('Label.DeleteForumCategory'),
    deleteForumPost: languageResource.get('Label.DeleteForumPost'),
    deleteForumComment: languageResource.get('Label.DeleteForumComment'),
    lockForumPost: languageResource.get('Label.LockForumPost'),
    unlockForumPost: languageResource.get('Label.UnlockForumPost'),
    pinForumPost: languageResource.get('Label.PinForumPost'),
    unpinForumPost: languageResource.get('Label.UnpinForumPost'),
    joinGroup: languageResource.get('Action.JoinGroup'),
    leaveGroup: languageResource.get('Action.LeaveGroup'),
    updateGroupIcon: languageResource.get('Label.UpdateGroupIcon'),
    updateGroupCoverPhoto: languageResource.get('Label.UpdateGroupCoverPhoto'),
    updateGroupSecuritySettings: languageResource.get('Label.UpdateGroupSecuritySettings')
  };

  return {
    getTextResources() {
      return $q(function (resolve, reject) {
        resolve(resources);
      });
    }
  };
}

configureGroupModule.factory('translationService', translationService);

export default translationService;
