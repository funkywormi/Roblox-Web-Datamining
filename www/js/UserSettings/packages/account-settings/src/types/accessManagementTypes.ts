export enum Access {
  Granted = "Granted",
  Denied = "Denied",
  Actionable = "Actionable",
}
enum Recourse {
  GovernmentId = "GovernmentId",
  Phone = "PHONE",
  Email = "EMAIL",
  AddedEmail = "AddedEmail",
  ParentConsentRequest = "ParentConsent",
  ParentLinkRequest = "ParentLink",
}
enum RequestType {
  UpdateUserSetting = "UpdateUserSetting",
  UpdateBirthdate = "UpdateBirthdate",
  LinkToChild = "LinkToChild",
  LiftPunishment = "LiftPunishment",
  AddTrustedConnection = "AddTrustedConnection",
  ReceiveTransfer = "ReceiveTransfer",
  SendTransfer = "SendTransfer",
  Unknown = "Unknown",
}

type RecourseResponse = {
  action: Recourse;
  parentConsentTypes?: RequestType[];
};

export interface AmpResponse {
  featureName: string;
  access: Access;
  recourses: RecourseResponse[];
}
