import Roblox from "Roblox";
import * as Captcha from "./captcha";
import * as CaptchaV2 from "./captchaV2";
import * as DeviceIntegrity from "./deviceIntegrity";
import * as ForceActionRedirect from "./forceActionRedirect";
import * as Generic from "./generic";
import * as HybridWrapper from "./hybridWrapper";
import * as Interface from "./interface";
import * as PrivateAccessToken from "./privateAccessToken";
import * as ProofOfSpace from "./proofOfSpace";
import * as ProofOfWork from "./proofOfWork";
import * as Rostile from "./rostile";
import * as SecurityQuestions from "./securityQuestions";
import * as Turnstile from "./turnstile";
import * as TwoStepVerification from "./twoStepVerification";

// This type constraint (`typeof Interface`) ensures that any changes made to
// the shared interface types for this component get reflected in its compiled
// definition.
const AccountIntegrityChallengeService: typeof Interface = {
  Captcha,
  CaptchaV2,
  DeviceIntegrity,
  ForceActionRedirect,
  Generic,
  HybridWrapper,
  PrivateAccessToken,
  ProofOfSpace,
  ProofOfWork,
  Rostile,
  SecurityQuestions,
  Turnstile,
  TwoStepVerification,
};

Object.assign(Roblox, {
  AccountIntegrityChallengeService,
});
