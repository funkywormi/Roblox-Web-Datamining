/* eslint-disable lines-between-class-members */
import * as CaptchaApi from "./apis/captcha";
import * as EmailApi from "./apis/email";
import * as CaptchaV2Api from "./apis/captchaV2";
import * as GamesApi from "./apis/games";
import * as MyAccountApi from "./apis/myAccount";
import * as OtpApi from "./apis/otp";
import * as PasswordsApi from "./apis/passwords";
import * as PhoneApi from "./apis/phone";
import * as PlaystationApi from "./apis/playstation";
import * as PromptAssignmentsApi from "./apis/promptAssignments";
import * as ProofOfSpaceApi from "./apis/proofOfSpace";
import * as ProofOfWorkApi from "./apis/proofOfWork";
import * as RostileApi from "./apis/rostile";
import * as SecurityQuestionsApi from "./apis/securityQuestions";
import * as SessionManagementApi from "./apis/sessionManagement";
import * as ThumbnailsApi from "./apis/thumbnails";
import * as TurnstileApi from "./apis/turnstile";
import * as TwoStepVerificationApi from "./apis/twoStepVerification";
import * as UniversalAppConfigurationApi from "./apis/universalAppConfiguration";
import * as XboxApi from "./apis/xbox";
import * as MetricsAPI from "./apis/metrics";
import * as PrivateAccessTokenApi from "./apis/privateAccessToken";
import * as GenericChallengeApi from "./apis/genericChallenge";
import * as AuthApi from "./apis/auth";
import * as Fido2Api from "./apis/fido2";
import * as AccountRecoveryApi from "./apis/accountRecovery";
import * as LegacyAccountInfoApi from "./apis/legacyAccountInfo";
import * as UserSettingsApi from "./apis/userSettings";
import * as UsersApi from "./apis/users";

/**
 * A class encapsulating the various HTTP requests in this web app.
 *
 * Note that all of the requests return `Result` types, which can be explicitly
 * instantiated with either a response value or an error, depending on whether
 * the request succeeded. The requests should only throw an error if a fatal
 * (i.e. unexpected) exception occurred.
 */
export class RequestServiceDefault {
  // Note that these names correspond to logical groupings of endpoints rather
  // than explicit microservices.
  captcha = CaptchaApi;
  captchaV2 = CaptchaV2Api;
  email = EmailApi;
  fido2 = Fido2Api;
  games = GamesApi;
  metrics = MetricsAPI;
  myAccount = MyAccountApi;
  otp = OtpApi;
  password = PasswordsApi;
  phone = PhoneApi;
  playstation = PlaystationApi;
  promptAssignments = PromptAssignmentsApi;
  securityQuestions = SecurityQuestionsApi;
  sessionManagement = SessionManagementApi;
  rostile = RostileApi;
  thumbnails = ThumbnailsApi;
  turnstile = TurnstileApi;
  twoStepVerification = TwoStepVerificationApi;
  universalAppConfiguration = UniversalAppConfigurationApi;
  proofOfSpace = ProofOfSpaceApi;
  proofOfWork = ProofOfWorkApi;
  xbox = XboxApi;
  privateAccessToken = PrivateAccessTokenApi;
  genericChallenge = GenericChallengeApi;
  authApi = AuthApi;
  accountRecoveryApi = AccountRecoveryApi;
  legacyAccountInfoApi = LegacyAccountInfoApi;
  userSettingsApi = UserSettingsApi;
  usersApi = UsersApi;
}

/**
 * An interface encapsulating the various HTTP requests in this web app.
 *
 * Note that all of the requests return `Result` types, which can be explicitly
 * instantiated with either a response value or an error, depending on whether
 * the request succeeded. The requests should only throw an error if a fatal
 * (i.e. unexpected) exception occurred.
 *
 * This interface type offers future flexibility e.g. for mocking the default
 * request service.
 */
export type RequestService = { [K in keyof RequestServiceDefault]: RequestServiceDefault[K] };
