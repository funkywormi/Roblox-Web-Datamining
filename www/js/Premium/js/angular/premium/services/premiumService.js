import { EnvironmentUrls, CurrentUser, DeviceMeta, FormEvents, Guac } from 'Roblox';
import premiumModule from '../premiumModule';

function premiumService(
  $q,
  $window,
  $httpParamSerializer,
  urlService,
  httpService,
  eventStreamService,
  premiumConstants,
  languageResource
) {
  'ngInject';

  function requestProducts(params) {
    if (!EnvironmentUrls || !EnvironmentUrls.premiumFeaturesApi) {
      return $q(function (resolve, reject) {
        reject({ errorMsg: 'Url is null. Please try again later.' });
      });
    }

    const url = EnvironmentUrls.premiumFeaturesApi + premiumConstants.urls.productsUrl;
    const urlConfig = {
      url
    };
    return httpService.httpGet(urlConfig, params);
  }

  function inRobloxApp() {
    return DeviceMeta().isInApp;
  }

  function isAndroidApp() {
    return DeviceMeta().isAndroidApp;
  }

  function isIosApp() {
    return DeviceMeta().isIosApp;
  }

  function isWin32App() {
    return DeviceMeta().isWin32App;
  }

  function isInDesktopMode() {
    return (
      (DeviceMeta().isDesktop && !DeviceMeta().isUWPApp) ||
      (!DeviceMeta().isAmazonApp &&
        !DeviceMeta().isUWPApp &&
        !DeviceMeta().isIosApp &&
        !DeviceMeta().isAndroidApp)
    );
  }

  function isInAppMode() {
    return (
      DeviceMeta().isAmazonApp ||
      DeviceMeta().isUWPApp ||
      DeviceMeta().isIosApp ||
      DeviceMeta().isAndroidApp
    );
  }

  function urlNullReject() {
    return $q(function (resolve, reject) {
      reject({ errorMsg: 'Url is null. Please try again later.' });
    });
  }

  return {
    inRobloxApp,

    isIosApp,

    isAndroidApp,

    isWin32App,

    isInDesktopMode,

    isInAppMode,

    getProductPolicy() {
      return Guac.callBehaviour('robux-product-policy');
    },

    getSubscriptionPageData() {
      return {
        subscriptions: [],
        recurringSubscriptions: [],
        nonRecurringSubscriptions: [],
        userPlan: null,
        errorMessage: null,
        isInAppMode: isInAppMode()
      };
    },

    getRobuxPageData() {
      return {
        robuxs: [],
        userPlan: null,
        errorMessage: null,
        isInAppMode: isInAppMode(),
        isInDesktopMode: isInDesktopMode(),
        upsellPackage: null,
        firstTimePackage: null
      };
    },

    getMembershipProducts() {
      return requestProducts({
        typeName: premiumConstants.premiumFeatureType.subscription,
        // By default, Subscription packages are not available to users that already have a subscription.
        // Using this flag to force the backend to return all subscription packages.
        skipPremiumUserCheck: true
      });
    },

    getAllProducts() {
      return requestProducts(); // no param, default return all products
    },

    getUserStatus() {
      if (!EnvironmentUrls.premiumFeaturesApi || !CurrentUser) {
        return urlNullReject();
      }

      const urlConfig = {
        url:
          EnvironmentUrls.premiumFeaturesApi +
          premiumConstants.urls.userStatusUrl.replace('{userid}', CurrentUser.userId)
      };
      return httpService.httpGet(urlConfig);
    },

    getPurchaseUrl(product, page) {
      if (!product) {
        return '';
      }
      let params = {};
      let url = '';
      if (isAndroidApp()) {
        params.id = product.mobileProductId.toLowerCase();
        params.recurring =
          product.premiumFeatureTypeName === 'Subscription' &&
          !product.mobileProductId.endsWith('OneMonth');
        url = premiumConstants.urls.mobilePaymentUrl + $httpParamSerializer(params);
      } else if (DeviceMeta().isAmazonApp || DeviceMeta().isUWPApp) {
        params.id = product.mobileProductId.toLowerCase();
        url = premiumConstants.urls.mobilePaymentUrl + $httpParamSerializer(params);
      } else if (isIosApp()) {
        params.id = product.mobileProductId;
        url = premiumConstants.urls.mobilePaymentUrl + $httpParamSerializer(params);
      } else {
        params = {
          ap: product.productId,
          page
        };
        url = premiumConstants.urls.paymentPageUrl + $httpParamSerializer(params);
      }
      return urlService.getAbsoluteUrl(url);
    },

    purchaseSubscription(params) {
      const paymentUrl = premiumConstants.urls.paymentPageUrl + $httpParamSerializer(params);
      $window.location.href = urlService.getAbsoluteUrl(paymentUrl);
    },

    patchSubscription(productId) {
      if (!EnvironmentUrls.premiumFeaturesApi || !CurrentUser) {
        return urlNullReject(); // return empty promise
      }
      let url =
        EnvironmentUrls.premiumFeaturesApi +
        premiumConstants.urls.userStatusUrl.replace('{userid}', CurrentUser.userId);
      const params = { productId };
      url += `?${$httpParamSerializer(params)}`;
      const urlConfig = {
        url
      };
      return httpService.httpPatch(urlConfig, productId);
    },

    getSubscriptionPageUrl() {
      return urlService.getAbsoluteUrl(premiumConstants.urls.subscribePageUrl);
    },

    getTermsPageUrl() {
      return urlService.getAbsoluteUrl(premiumConstants.urls.termsUrl);
    },

    getPrivacyPageUrl() {
      return urlService.getAbsoluteUrl(premiumConstants.urls.privacyUrl);
    },

    getRevocationPolicyUrl() {
      return urlService.getAbsoluteUrl(premiumConstants.urls.revocationPolicyUrl);
    },

    getBillingSettingUrl() {
      return urlService.getAbsoluteUrl(premiumConstants.urls.billingSettingUrl);
    },

    sendInteractionClickEvent(context, input, pid, fromPid, field) {
      const params = {
        pid,
        from_pid: fromPid
      };
      if (FormEvents) {
        FormEvents.SendInteractionClick(context, field, input, params);
      }
    },

    sendModalClickEvent(context, aType, pid, fromPid) {
      const params = {
        pid,
        from_pid: fromPid
      };
      eventStreamService.sendModalEvent(context, aType, params);
    },

    sendModalShownEvent(context, pid, fromPid) {
      const params = {
        pid,
        from_pid: fromPid
      };
      eventStreamService.sendModalEvent(context, eventStreamService.modalActions.shown, params);
    },

    sendModalDismissedEvent(context, pid, fromPid) {
      const params = {
        pid,
        from_pid: fromPid
      };
      eventStreamService.sendModalEvent(context, eventStreamService.modalActions.dismissed, params);
    },

    getMembershipMapping(subscriptionType) {
      const lang = languageResource;

      switch (subscriptionType) {
        case premiumConstants.subscriptions.RobloxPremium450:
        case premiumConstants.subscriptions.RobloxPremium450OneMonth:
          return lang.get('Label.RobloxPremium450');

        case premiumConstants.subscriptions.RobloxPremium1000:
        case premiumConstants.subscriptions.RobloxPremium1000OneMonth:
          return lang.get('Label.RobloxPremium1000');

        case premiumConstants.subscriptions.RobloxPremium2200:
        case premiumConstants.subscriptions.RobloxPremium2200OneMonth:
          return lang.get('Label.RobloxPremium2200');
        default:
          return lang.get('Label.RobloxPremium');
      }
    },

    getUsersCurrentPlatform() {
      let deviceType = '';

      if (DeviceMeta().isAndroidApp) {
        deviceType = premiumConstants.platformType.isAndroidApp;
      } else if (DeviceMeta().isAmazonApp) {
        deviceType = premiumConstants.platformType.isAmazonApp;
      } else if (DeviceMeta().isIosApp) {
        deviceType = premiumConstants.platformType.isIosApp;
      } else if (DeviceMeta().isUWPApp) {
        deviceType = premiumConstants.platformType.isUwpApp;
      } else if (DeviceMeta().isXboxApp) {
        deviceType = premiumConstants.platformType.isXboxApp;
      } else if (DeviceMeta().isUniversalApp) {
        deviceType = premiumConstants.platformType.isUniversalApp;
      } else {
        deviceType = premiumConstants.platformType.isDesktop;
      }

      return deviceType;
    },

    getPurchaseWarning(productId, is13To17ScaryModalEnabled = false) {
      if (!EnvironmentUrls || !EnvironmentUrls.apiGatewayUrl) {
        return urlNullReject();
      }

      const params = {
        productId,
        is13To17ScaryModalEnabled
      };

      const url = `${EnvironmentUrls.apiGatewayUrl}${
        premiumConstants.urls.purchaseWarningUrl
      }${$httpParamSerializer(params)}`;
      const urlConfig = {
        url
      };
      return httpService.httpGet(urlConfig);
    },

    acknowledgePurchaseWarning(action, timeout) {
      if (!EnvironmentUrls || !EnvironmentUrls.apiGatewayUrl) {
        return urlNullReject();
      }

      const urlConfig = {
        url: `${EnvironmentUrls.apiGatewayUrl}${premiumConstants.urls.acknowledgePurchaseWarningUrl}`,
        timeout
      };
      const params = {
        acknowledgement: action
      };
      return httpService.httpPost(urlConfig, params);
    }
  };
}

premiumModule.factory('premiumService', premiumService);

export default premiumService;
