import premiumModule from '../premiumModule';

const premiumConstants = {
  modals: {
    bodyCenterCss: 'premium-modal-center'
  },
  templates: {
    annualPremiumBanner: 'annual-premium-banner',
    subscriptionCard: 'subscription-card',
    subscriptionContainer: 'subscription-container',
    robuxPackage: 'robux-package',
    robuxContainer: 'robux-container',
    robuxContainerBase: 'robux-container-base',
    robuxSubscriptionUpsellContainer: 'robux-subscription-upsell-container',
    robuxSubscriptionUpsellPackage: 'robux-subscription-upsell-package',
    purchaseWarningModal: 'purchase-warning-modal',
    highlightBadge: 'highlight-badge'
  },
  urls: {
    productsUrl: '/v1/products',
    userStatusUrl: '/v1/users/{userid}/subscriptions',
    paymentPageUrl: '/upgrades/paymentmethods?',
    mobilePaymentUrl: '/mobile-app-upgrades/buy?',
    subscribePageUrl: '/premium/membership?ctx=leftnav',
    termsUrl: '/info/terms',
    privacyUrl: '/info/privacy',
    revocationPolicyUrl: '/info/terms#eu-uk-revocation-policy',
    robuxInfoUrl: '/info/get-robux',
    billingSettingUrl: '/my/account#!/billing',
    purchaseWarningUrl: '/purchase-warning/v1/purchase-warnings?',
    acknowledgePurchaseWarningUrl: '/purchase-warning/v1/purchase-warnings/acknowledge'
  },
  pageContext: {
    robux: 'PremiumRobux',
    subscription: 'PremiumSubscriptions',
    purchaseWarningModal: 'purchaseWarningModal'
  },
  errorCodes: {
    productsNotFound: 1,
    userNotFound: 10,
    userSubscriptionNotFound: 20,
    unableToCaculateRobuxGrant: 50,
    exceedRobuxGrantMax: 51
  },
  events: {
    buyButtonClicked: 'Roblox.Membership.buySubscription'
  },
  streamEventParams: {
    active: 'active',
    willExpire: 'will_expire',
    wantMoreBtn: 'want_more',
    robloxHelpLink: 'robux_help_page',
    learnMoreLink: 'learn_more_premium',
    getMoreLink: 'get_more_premium',
    termsOfUseLink: 'terms_use_premium',
    revocationPolicyLink: 'revocation_policy_premium',
    privacyPolicyLink: 'privacy_policy_premium',
    buyBtn: 'buy',
    robuxPackagesTooltip: 'robux_package_info',
    subscriberPremiumTooltip: 'subscriber_premium_info',
    nonSubscriberPremiumTooltip: 'non_subscriber_premium_info'
  },
  premiumFeatureType: {
    subscription: 'Subscription',
    robux: 'Robux',
    unknown: 'unknown',
    month: 'month'
  },
  messages: {
    upgradeErrorTitle: 'Upgrade Unavailable',
    upgradeErrorBody:
      "We're sorry, we are unable to change your subscription as we can not currently pay out your remaining Robux balance. Please contact customer support at https://www.roblox.com/support."
  },

  subscriptions: {
    RobloxPremium450: 'RobloxPremium450',
    RobloxPremium1000: 'RobloxPremium1000',
    RobloxPremium2200: 'RobloxPremium2200',
    RobloxPremium450OneMonth: 'RobloxPremium450OneMonth',
    RobloxPremium1000OneMonth: 'RobloxPremium1000OneMonth',
    RobloxPremium2200OneMonth: 'RobloxPremium2200OneMonth'
  },

  firstTimeRobuxPurchasePackage: {
    FourtyRobux: '40 Robux'
  },

  platformType: {
    isAndroidApp: 'isAndroidApp',
    isAmazonApp: 'isAmazonApp',
    isIosApp: 'isIosApp',
    isUwpApp: 'isUwpApp',
    isXboxApp: 'isXboxApp',
    isUniversalApp: 'isUniversalApp',
    isDesktop: 'isDesktop'
  },

  purchaseWarningActions: {
    U13PaymentModal: 'U13PaymentModal',
    ParentalConsentWarningPaymentModal13To17: 'ParentalConsentWarningPaymentModal13To17',
    U13MonthlyThreshold1Modal: 'U13MonthlyThreshold1Modal',
    RequireEmailVerification: 'RequireEmailVerification',
    U13MonthlyThreshold2Modal: 'U13MonthlyThreshold2Modal'
  },

  purchaseDevice: {
    mobile: 'mobile',
    desktop: 'desktop'
  },

  annualPremiumExp: {
    layerName: 'Payments.AnnualPremium'
  }
};

premiumModule.constant('premiumConstants', premiumConstants);

export default premiumConstants;
