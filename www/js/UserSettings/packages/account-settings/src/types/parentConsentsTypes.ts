import { CancelPendingConsentErrorCode, TUserSettingsBody } from "@rbx/user-settings";

export enum ParentConsentType {
  UpdateUserSetting = "UpdateUserSetting",
  UpdateBirthdate = "UpdateBirthdate",
  ManageFriend = "ManageFriend",
  LiftPunishment = "LiftPunishment",
  LiftRestriction = "LiftRestriction",
  ManageExperience = "ManageExperience",
  AddTrustedConnection = "AddTrustedConnection",
  ReceiveTransfer = "ReceiveTransfer",
  SendTransfer = "SendTransfer",
}

export enum ParentConsentStatus {
  Pending = "Pending",
}

export enum ParentConsentSettingName {
  NewBirthdate = "newBirthdate",
}

export enum PunishmentType {
  Chargeback = "Chargeback",
}

export type TConsentData = {
  // Update birthdate consent
  newBirthdate?: string;

  // Manage friend consent
  friendUserId?: number;
  friendManagementAction?: ManagementAction;

  // Add trusted connection consent
  targetUserId?: number;

  // Manage experience consent
  universeId?: number;
  experienceManagementAction?: ManagementAction;

  // chargeback consent
  punishmentType?: PunishmentType;

  // transfer consents
  transferType?: TransferType;
  transferId?: number;
  robuxTransferAmount?: number;

  // lift restriction consent
  restrictionType?: RestrictionType;

  // TODO: Add the rest of the consent types
} & TUserSettingsBody; // Update user setting consent

export type TConsentResponse = {
  id: string;
  childUserId: number;
  parentUserId?: string | null;
  consentType: ParentConsentType;
  consentOutcome?: string | null;
  consentData?: TConsentData;
  createdTime: string;
};

export type TGetConsentsRequest = {
  childUserId: number;
  consentStatus: ParentConsentStatus;
  consentType?: ParentConsentType; // Optional - omit to fetch ALL consent types
  cursor?: string;
  fetchSinglePageOnly?: boolean; // Default: false (fetch all pages recursively). Set to true to fetch only a single page (for pagination).
};

export type TGetConsentsResponse = {
  consents: TConsentResponse[];
  nextCursor?: string;
};

export type TCancelPendingConsentError = {
  data: {
    code: CancelPendingConsentErrorCode;
  };
};

export enum ConsentAnswer {
  Approve = "Approve",
  Deny = "Deny",
}

export type TAnswerConsentRequest = {
  consentId: string;
  answer: ConsentAnswer;
  childUserId: number;
  auditDataHeader?: string;
};

export enum ManagementAction {
  Block = "Block",
  Unblock = "Unblock",
  Approve = "Approve",
  RevokeApproval = "RevokeApproval",
}

export type TGrantConsentRequest = {
  childUserId: number;
  consentType: ParentConsentType;
  details: TConsentData;
};

export enum TransferType {
  Robux = "Robux",
}

export enum RestrictionType {
  PlatformAccess = "PlatformAccess",
}
