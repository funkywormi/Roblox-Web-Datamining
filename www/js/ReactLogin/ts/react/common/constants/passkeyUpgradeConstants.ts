const passkeySessionStorageKeys = {
  upgradeKey: 'RBXPasskeyUpgradePending',
  upgradeUserIdKey: 'RBXPasskeyUpgradeUserId',
  upgradeImmediateLogin: 'ImmediateLogin',
  upgradeDelayedLogin: 'DelayedLogin',
  upgradeDelayedSignup: 'DelayedSignup'
} as const;

export default passkeySessionStorageKeys;
