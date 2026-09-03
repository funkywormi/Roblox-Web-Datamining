export const rootElementId = 'access-management-upsell-container';

export const accessManagementUpselTranslationConfig = {
  common: [
    'CommonUI.Controls',
    'CommonUI.Features',
    'Amp.Upsell',
    'Amp.FAEUpsell',
    'Feature.Friends',
    'Feature.AccountSettings'
  ],
  feature: 'Verification.Identity'
};

export const emailUpsellTranslationConfig = {
  common: ['CommonUI.Controls'],
  feature: 'Feature.VerificationUpsell'
};

export const updateSettingsTranslationConfig = {
  common: ['CommonUI.Controls'],
  feature: 'Feature.LegallySensitiveContent'
};

export const legallySensitiveContentTranslationConfig = {
  common: ['CommonUI.Controls', 'Feature.Parents', 'Feature.AccountSettings'],
  feature: 'Feature.LegallySensitiveContent'
};

export const parentalRequestTranslationConfig = {
  common: ['CommonUI.Controls', 'CommonUI.Features', 'Amp.Upsell'],
  feature: 'Feature.Parents'
};

export const accountSettingsRedirectTranslationConfig = {
  common: [] as string[],
  feature: 'Feature.AgeVerificationUpsell'
};
