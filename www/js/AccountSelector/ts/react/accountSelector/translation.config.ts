type TConfig = {
  common: string[];
  feature: string;
};

export const accountSelectorConfig: TConfig = {
  common: ['CommonUI.Controls'],
  feature: 'Authentication.OneTimePasscode'
};

export default {
  accountSelectorConfig
};
