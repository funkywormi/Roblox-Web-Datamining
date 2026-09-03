// translation strings - keys and fallback values
export const translations = {
  requestRobuxTitle: {
    key: "Heading.Gifting.RequestRobuxBannerTitle",
    default: "Get the gift of Robux",
  },
  requestRobuxSubtitle: {
    key: "Message.Gifting.RequestRobuxBannerSubtitle",
    default: "Friends and family can buy you Robux, even if they're not on Roblox.",
  },
  giftingRobuxTitle: {
    key: "Heading.Gifting.GiftingRobuxTitle",
    default: "Gift Robux",
  },
  giftingRobuxSubtitle: {
    key: "Message.Gifting.GiftingRobuxSubtitle",
    default: "Send up to 25% more Robux to friends and family!",
  },
  robloxSectionTitle: {
    key: "Heading.Gifting.RobloxSection",
    default: "What's Roblox?",
  },
  robloxSectionSubtitle: {
    key: "Message.Gifting.RobloxSection",
    default:
      "Roblox is a global platform where millions of people create, play, and connect. Robux is the virtual currency that lets users customize their avatar, access experiences, and more.",
  },
  giftingRobuxSectionTitle: {
    key: "Heading.Gifting.GiftingRobuxSection",
    default: "What's Gift Robux?",
  },
  giftingRobuxSectionSubtitle: {
    key: "Message.Gifting.GiftingRobuxSection",
    default: `This feature lets you send Robux directly to the Roblox account of the person who shared this link. Just follow the steps to complete your gift—no codes or gift cards needed.`,
  },
  reportUserSectionTitle: {
    key: "Heading.Gifting.ReportUserSection",
    default: "Don't know the person?",
  },
  reportUserSectionSubtitle: {
    key: "Message.Gifting.ReportUserSection",
    default:
      "If you don't know the person sending the link, you can ignore it and contact Roblox support.",
  },
  requestRobuxHeading: {
    key: "Heading.Gifting.RequestRobux",
    default: "Request Robux",
  },
  requestRobuxDescriptionLine1: {
    key: "Message.Gifting.RequestRobuxDescriptionLine1",
    default:
      "Let others scan your QR code with their device, or share the link below to request Robux directly to your account.",
  },
  requestRobuxDescriptionLine2: {
    key: "Message.Gifting.RequestRobuxDescriptionLine2",
    default: "Note: your username and profile picture will be shared.",
  },
  requestRobuxAction: {
    key: "Action.Gifting.RequestRobux",
    default: "Request Robux",
  },
  newLabel: {
    key: "Message.Gifting.New",
    default: "New",
  },
  shareUrl: {
    key: "Action.Gifting.ShareUrl",
    default: "Share",
  },
  copyAndShareUrl: {
    key: "Action.Gifting.CopyAndShareUrl",
    default: "Copy & share this link",
  },
  urlCopied: {
    key: "Message.Gifting.UrlCopied",
    default: "Link copied!",
  },
  close: {
    key: "Action.Gifting.Close",
    default: "Close",
  },
  giftNow: {
    key: "Action.Gifting.GiftNow",
    default: "Gift now",
  },
  sendingTo: {
    key: "Message.Gifting.SendingTo",
    default: "Sending to:",
  },
  selectProduct: {
    key: "Action.Gifting.SelectProduct",
    default: "Choose a Robux amount",
  },
  selectMessage: {
    key: "Action.Gifting.SelectMessage",
    default: "Choose a message",
  },
  includeMessage: {
    key: "Action.Gifting.IncludeMessage",
    default: "Include a message",
  },
  optional: {
    key: "Message.Gifting.Optional",
    default: "(optional)",
  },
  checkout: {
    key: "Action.Gifting.Checkout",
    default: "Checkout",
  },
  checkoutDescription: {
    key: "Message.Gifting.CheckoutDescription",
    default:
      "Complete the purchase by entering your payment information in the checkout page. Refunds are not allowed.",
  },
  legalDisclosure: {
    key: "Message.Gifting.GiftingProductsLegalDisclosure.DMCCA",
    default:
      "Robux is provided to you by Roblox. When you buy Robux you receive only a limited, non-refundable, non-transferable, revocable license to use Robux, which has no value in real currency. By proceeding, (1) you agree that you are over 18 and that you authorize us to charge your account, and (2) you represent that you understand and agree to the Terms of Use, which includes an agreement to arbitrate any dispute between you and Roblox, and Privacy Policy.",
  },
  robux: {
    key: "Label.Gifting.Robux",
    default: "Robux",
  },
  mostPopular: {
    key: "Label.Gifting.MostPopular",
    default: "Most Popular",
  },
  ensureCorrectness: {
    key: "Message.Gifting.EnsureCorrectness",
    default: "Make sure the user information is correct.",
  },
  contactSupport: {
    key: "Message.Gifting.ContactSupport",
    default: "Don't know this person? Contact Roblox support",
  },
  recipientIneligibleErrorTitle: {
    key: "Heading.Gifting.RecipientIneligibleError",
    default: "Recipient is unavailable",
  },
  recipientIneligibleErrorSubtitle: {
    key: "Description.Gifting.RecipientIneligibleError",
    default: "Sorry, this user cannot receive Roblox gifts.",
  },
  searchUsername: {
    key: "Label.Gifting.SearchUsername",
    default: "Search username",
  },
  noResultsFound: {
    key: "Message.Gifting.NoResultsFound",
    default: "No results found",
  },
} as const;

export const COUNTER_METRICS = {
  PHONE_VERIFICATION_SESSION_SEND_400: "PhoneVerificationSessionSend400",
  PHONE_VERIFICATION_SESSION_SEND_429: "PhoneVerificationSessionSend429",
  PHONE_VERIFICATION_SESSION_SEND_500: "PhoneVerificationSessionSend500",
  PHONE_VERIFICATION_SESSION_VERIFY_401: "PhoneVerificationSessionVerify401",
  PHONE_VERIFICATION_SESSION_VERIFY_403: "PhoneVerificationSessionVerify403",
  PHONE_VERIFICATION_SESSION_VERIFY_500: "PhoneVerificationSessionVerify500",
  PHONE_PREFIXES_GET_500: "PhonePrefixesGet500",
  ROBUX_GIFTING_LANDING_PAGE_HIT: "RobuxGiftingLandingPageHit",
  ROBUX_GIFTING_LANDING_PAGE_HIT_INVALID_USER: "RobuxGiftingLandingPageHitInvalidUser",
  ROBUX_GIFTING_GET_USER_NAME_400: "RobuxGiftingGetUserName400",
  ROBUX_GIFTING_GET_USER_NAME_429: "RobuxGiftingGetUserName429",
  ROBUX_GIFTING_GET_USER_NAME_500: "RobuxGiftingGetUserName500",
  ROBUX_GIFTING_USER_SEARCH_CLICK_BUTTON: "RobuxGiftingUserSearchClickButton",
  ROBUX_GIFTING_USER_SEARCH_SELECT_RESULT: "RobuxGiftingUserSearchSelectResult",
};

export const URLs = {
  termsUrl: "/info/terms",
  privacyUrl: "/info/privacy",
  supportUrl: "/support",
};

export const DEFAULT_GIFT_MESSAGE = "Message.Gifting.GiftMessage1";

export const DEFAULT_USER_ID = 1;

export const USER_SEARCH_DEBOUNCE_TIME_MS = 500;
export const USER_SEARCH_MAX_RESULTS = 5;
export const USER_SEARCH_MIN_CHARACTERS = 3;
export const USER_SEARCH_MAX_CHARACTERS = 30;
