import { DateComponent } from "../types/ageGate";
import { SelectedItems, SupportFormState } from "../types/common";
import { SupportTicketStateKey } from "../types/supportTicket";

export const defaultTicketFormFields = (): SupportFormState => ({
  [SupportTicketStateKey.Username]: "",
  [SupportTicketStateKey.FirstName]: "",
  [SupportTicketStateKey.Email]: "",
  [SupportTicketStateKey.ConfirmEmail]: "",
  [SupportTicketStateKey.AssetId]: "",
  [SupportTicketStateKey.UniverseId]: "",
  [SupportTicketStateKey.DeviceType]: "",
  [SupportTicketStateKey.HelpCategoryType]: "",
  [SupportTicketStateKey.HelpSubCategoryType]: "",
  [SupportTicketStateKey.Message]: "",
});

export const defaultTicketFormSelectables = (): SelectedItems<DateComponent> => ({
  [SupportTicketStateKey.DeviceType]: null,
  [SupportTicketStateKey.HelpCategoryType]: null,
  [SupportTicketStateKey.HelpSubCategoryType]: null,
});

export const defaultMaxInputFieldLength = 350;

export const defaultMaxIssueDescriptionFieldLength = 750;

export const ticketSubmissionCaptchaContainerId = "reactTicketSubmissionCaptchaContainer";

export const ticketSupportArticleEventType = "SupportArticle";

export const validationMessages = {
  usernameInvalid: "Response.UsernameInvalid",
  usernameAlreadyInUse: "Response.UsernameAlreadyInUse",
  badUsername: "Response.BadUsername",
  usernamePii: "Response.UsernamePrivateInfo",
  usernameNotAvailable: "Response.UsernameNotAvailable",
  usernameRequired: "Response.PleaseEnterUsername",
  birthdayRequired: "Response.BirthdayMustBeSetFirst",
  useDifferentPassword: "Response.DifferentPasswordRequired",
  passwordInvalid: "Response.InvalidPassword",
  birthdayInvalid: "Response.InvalidBirthday",
  javascriptRequired: "Response.JavaScriptRequired",
  unknownError: "Response.UnknownError",
  accountCreatedButLoginFailed: "Response.UserAccountCreatedButLoginFailed",
  captchaFailedToLoad: "Response.CaptchaErrorFailedToLoad",
  captchaFailedToVerify: "Response.CaptchaErrorFailedToVerify",
  invalidEmail: "Response.InvalidEmail",
  usernameEmpty: "Response.UsernameEmpty",
};
