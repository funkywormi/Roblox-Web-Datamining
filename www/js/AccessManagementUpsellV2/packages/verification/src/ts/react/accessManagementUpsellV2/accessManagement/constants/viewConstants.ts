import { TFeatureSpecificData } from 'Roblox';
import { Access, WizardIntent } from '../../enums';
import { ExtraParameter } from '../../types/AmpTypes';

export const ModalEvent = {
  StartAccessManagementUpsell: 'StartAccessManagementUpsell',
  ShowDownloadAppModal: 'ShowDownloadAppModal'
};

export type AccessManagementUpsellEventParams = {
  featureName: string;
  redirectLink: string;
  ampFeatureCheckData: ExtraParameter[];
  isAsyncCall: boolean;
  usePrologue: boolean;
  ampRecourseData: any;
  featureSpecificData: TFeatureSpecificData;
  namespace: string;
  wizardIntent: WizardIntent;
  closeCallback: (access: Access) => string;
};

export const PrologueConstants = {
  Action: {
    Continue: 'Action.Continue',
    Cancel: 'Action.Cancel',
    EmailMyParent: 'Action.EmailMyParent',
    VerifyID: 'Action.VerifyID',
    AskNow: 'Action.AskNowLowercase'
  },
  Title: {
    AskYourParent: 'Title.AskYourParent',
    VerifyYourAge: 'Title.VerifyYourAge',
    CheckYourAge: 'Title.CheckYourAge'
  },
  Description: {
    AddFriendVpc: 'Label.AddFriendVPC',
    Vpc: 'Description.PrologueTextVpc',
    Idv: 'Description.PrologueTextIdv',
    Fae: 'Description.PrologueTextFae',
    IdvConnectingText: 'Description.PrologueConnectingTextIdv',
    IdvAndVpc: 'Description.PrologueTextIdvAndVpc',
    IdvAndVpcAgeCorrection: 'Description.PrologueIdvAndVpcAgeCorrection',
    VpcEnablePurchase: 'Description.PrologueEnablePurchase',
    VpcEnablePurchaseExpT1: 'Description.PrologueEnablePurchaseExpT1',
    VpcUnblockUser: 'Description.PrologueUnblockUser',
    VpcUnblockExperience: 'Description.PrologueUnblockExperience',
    VpcAllowFacialAgeEstimation: 'Description.CommsAgeCheck.VPCForFAEModal',
    VpcContentAgeRestriction: 'Description.PrologueJoinExperience',
    VpcWhisperChatWithMeInExperiences: 'Description.CommsAgeCheck.VPCForExperienceDirectChatModal',
    VpcExperienceChat: 'Description.CommsAgeCheck.VPCForExperienceChatModal',
    VpcStudioCollaboration: 'Description.CommsAgeCheck.VPCForStudioCollaborationModal',
    FaeExperienceChat: 'Description.CommsAgeCheck.FaeForExperienceChatModal',
    FaeExperienceWhisperChat: 'Description.CommsAgeCheck.FaeForExperienceWhisperChatModal',
    FaeStudioCollaboration: 'Description.CommsAgeCheck.FaeForStudioCollaborationModal',
    PrologueFetchParentExperiment: 'Description.PrologueFetchParentExperiment'
  },
  Error: {
    TryAgain: 'Response.ErrorTryAgain'
  }
};

export const EpilogueConstants = {
  Action: {
    LearnMore: 'Action.LearnMore'
  },
  Title: {
    VerifyYourAge: 'Title.VerifyYourAge'
  },
  Description: {
    VpcNotEligible: 'Description.PrologueTextVpcNotEligible'
  }
};
