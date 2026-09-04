import { EnvironmentUrls } from 'Roblox';
import { getClassNameWithLocale } from '../utils/landingUtils';

export const experimentLayer = 'Website.LandingPage';
export const playerAppSignupLayer = 'PlayerApp.Signup';

export const urlConstants = {
  loginLink: `${EnvironmentUrls.websiteUrl}/login`,
  italyContentRatingGuide: 'https://pegi.info/'
};

export const landingPageStrings = {
  amazonStore: 'Label.RobloxAmazonStore',
  amazonStoreLink: 'Link.AmazonStoreRobloxApp',
  appStore: 'Label.RobloxAppStore',
  appStoreLink: 'Link.AppleAppStoreRobloxApp',
  brazilContentRatingTitle: 'Label.BrazilContentRatingLogoTitle',
  brazilContentRatingTitleSixteen: 'Label.BrazilContentRatingLogoTitleSixteen',
  brazilContentRatingSubtitle: 'Label.BrazilContentRatingLogoSubtitle',
  brazilContentDescriptorInappropriateLanguage:
    'Label.BrazilContentDescriptorInappropriateLanguage',
  brazilContentDescriptorViolence: 'Label.BrazilContentDescriptorViolence',
  brazilInteractiveElementDescriptorInGamePurchases:
    'Label.BrazilInteractiveElementDescriptorInGamePurchases',
  brazilInteractiveElementDescriptorUsersInteract:
    'Label.BrazilInteractiveElementDescriptorUsersInteract',
  continue: 'Action.Continue',
  cancel: 'Action.Cancel',
  externalWebsiteRedirect: 'Description.ExternalWebsiteRedirect',
  googlePlay: 'Label.GetOnGooglePlay',
  googlePlayStoreLink: 'Link.GooglePlayStoreRobloxApp',
  italyContentRatingTitle: 'Label.ItalyContentRatingLogoTitle',
  leavingRoblox: 'Heading.LeavingRoblox',
  logIn: 'Action.LogInCapitalized',
  robloxOnDevice: 'Heading.RobloxOnDevice',
  windowsStore: 'Label.RobloxWindowsStore',
  windowsStoreLink: 'Link.WindowsStoreRobloxApp',
  xbox: 'Label.RobloxOnXbox',
  xboxStoreLink: 'Link.XboxStoreRobloxApp'
};

type appStoreLinkStrings = {
  href: string;
  className: string;
  name: string;
  title: string;
};

export const appStoreLinkConstants: appStoreLinkStrings[] = [
  {
    href: landingPageStrings.appStoreLink,
    className: getClassNameWithLocale('apple-badge'),
    name: 'apple',
    title: landingPageStrings.appStore
  },
  {
    href: landingPageStrings.googlePlayStoreLink,
    className: getClassNameWithLocale('google-badge'),
    name: 'google',
    title: landingPageStrings.googlePlay
  },
  {
    href: landingPageStrings.amazonStoreLink,
    className: getClassNameWithLocale('amazon-badge'),
    name: 'amazon',
    title: landingPageStrings.amazonStore
  },
  {
    href: landingPageStrings.xboxStoreLink,
    className: 'xbox-badge',
    name: 'xbox',
    title: landingPageStrings.xbox
  },
  {
    href: landingPageStrings.windowsStoreLink,
    className: getClassNameWithLocale('microsoft-badge'),
    name: 'microsoft',
    title: landingPageStrings.windowsStore
  }
];
