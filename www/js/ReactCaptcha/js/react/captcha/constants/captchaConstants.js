import { EnvironmentUrls } from 'Roblox';

const captchaV2Constants = {
  urls: {
    getMetadata: `${EnvironmentUrls.apiGatewayCdnUrl}/captcha/v1/metadata`,

    funCaptchaRedeem: {
      WebSignup: `${EnvironmentUrls.captchaApi}/v1/funcaptcha/signup/web`,
      AppSignup: `${EnvironmentUrls.captchaApi}/v1/funcaptcha/signup/app`,
      WebLogin: `${EnvironmentUrls.captchaApi}/v1/funcaptcha/login/web`,
      AppLogin: `${EnvironmentUrls.captchaApi}/v1/funcaptcha/login/app`,
      WebResetPassword: `${EnvironmentUrls.captchaApi}/v1/funcaptcha/resetpassword/web`,
      UserAction: `${EnvironmentUrls.captchaApi}/v1/funcaptcha/user`,
      WebGamecardRedemption: `${EnvironmentUrls.captchaApi}/v1/funcaptcha/gamecardredemption/web`
    }
  },

  captchaActionTypes: {
    login: 'login',
    appLogin: 'appLogin',
    signup: 'signup',
    appSignup: 'appSignup',
    groupJoin: 'groupJoin',
    groupWallPost: 'groupWallPost',
    resetPassword: 'resetPassword',
    toyCodeRedeem: 'toyCodeRedeem',
    gameCardRedeem: 'gameCardRedeem',
    followUser: 'followUser'
  },

  // Keys should map to captchaActionTypes.
  funCaptchaCaptchaTypes: {
    login: 'Login',
    appLogin: 'AppLogin',
    signup: 'Signup',
    appSignup: 'AppSignup',
    groupJoin: 'JoinGroup',
    groupWallPost: 'GroupWallPost',
    resetPassword: 'ResetPassword',
    toyCodeRedeem: 'ToyCodeRedeem',
    gameCardRedeem: 'GameCardRedeem',
    followUser: 'FollowUser'
  },

  // There must be a key for each value in funCaptchaCaptchaTypes
  funCaptchaPublicKeyMap: {
    Login: 'ACTION_TYPE_WEB_LOGIN',
    AppLogin: 'ACTION_TYPE_WEB_LOGIN',
    Signup: 'ACTION_TYPE_WEB_SIGNUP',
    AppSignup: 'ACTION_TYPE_WEB_SIGNUP',
    JoinGroup: 'ACTION_TYPE_GROUP_JOIN',
    GroupWallPost: 'ACTION_TYPE_GROUP_WALL_POST',
    ResetPassword: 'ACTION_TYPE_WEB_RESET_PASSWORD',
    ToyCodeRedeem: 'ACTION_TYPE_WEB_GAMECARD_REDEMPTION',
    GameCardRedeem: 'ACTION_TYPE_WEB_GAMECARD_REDEMPTION',
    FollowUser: 'ACTION_TYPE_FOLLOW_USER',
    AssetComment: 'ACTION_TYPE_ASSET_COMMENT'
  },

  funCaptchaEvents: {
    resolve: 'resolve',
    reject: 'reject',
    shown: 'shown'
  },

  captchaProviders: {
    arkoseLabs: 'PROVIDER_ARKOSE_LABS'
  },

  errorCodes: {
    internal: {
      unknown: 0,
      missingPrivateKey: 1,
      missingActionType: 2,
      failedToLoadProviderScript: 3,
      failedToVerify: 4
    }
  },

  literals: {
    close: 'Close'
  }
};

export default captchaV2Constants;
