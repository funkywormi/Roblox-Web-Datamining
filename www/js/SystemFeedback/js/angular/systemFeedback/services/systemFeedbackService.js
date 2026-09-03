import angular from 'angular';
import systemFeedbackModule from '../systemFeedbackModule';

function systemFeedbackService($timeout) {
  'ngInject';

  const allBannerType = {
    LOADING: 'alert-loading',
    SUCCESS: 'alert-success',
    WARNING: 'alert-warning'
  };
  const allConfig = {
    strType: ['successMessage', 'loadingMessage', 'warningMessage'],
    numType: ['timeoutShow', 'timeoutHide'],
    boolTypes: ['isHtmlAllowed']
  };

  const defaultConfig = {
    successMessage: '',
    loadingMessage: '',
    warningMessage: '',
    timeoutShow: 200,
    timeoutHide: 2000,
    isHtmlAllowed: false
  };

  const params = {
    bannerType: '',
    bannerText: '',
    showBanner: false,
    showCloseButton: false
  };

  const validateConfig = function(config) {
    const validatedConfig = {};
    // Strings
    allConfig.strType.forEach(function(strTypeConfig) {
      const configVal = config[strTypeConfig];
      if (angular.isString(configVal)) {
        validatedConfig[strTypeConfig] = configVal;
      }
    });
    // Numbers
    allConfig.numType.forEach(function(numTypeConfig) {
      const configVal = config[numTypeConfig];
      if (angular.isNumber(configVal)) {
        validatedConfig[numTypeConfig] = configVal;
      }
    });
    // Bool
    allConfig.boolTypes.forEach(boolTypeConfig => {
      const configVal = config[boolTypeConfig];
      if (typeof configVal === 'boolean') {
        validatedConfig[boolTypeConfig] = configVal;
      }
    });

    return validatedConfig;
  };

  const getBannerText = function(message, bannerType) {
    if (angular.isString(message)) {
      return message;
    }
    switch (bannerType) {
      case allBannerType.SUCCESS:
        return defaultConfig.successMessage;
      case allBannerType.WARNING:
        return defaultConfig.warningMessage;
      case allBannerType.LOADING:
      default:
        return defaultConfig.loadingMessage;
    }
  };

  const getBannerTimeouts = function(message, timeoutShow, timeoutHide, bannerType) {
    const bannerTimeouts = {
      timeoutShow: angular.isNumber(timeoutShow) ? timeoutShow : defaultConfig.timeoutShow
    };

    if (angular.isNumber(timeoutHide)) {
      bannerTimeouts.timeoutHide = timeoutHide;
    } else if (bannerType !== allBannerType.WARNING) {
      if (message && angular.isString(message)) {
        bannerTimeouts.timeoutHide = Math.min(10000, 1000 + 300 * message.split(/(\s+)/).length);
      } else {
        bannerTimeouts.timeoutHide = defaultConfig.timeoutHide;
      }
    }

    return bannerTimeouts;
  };

  const buildBannerOptions = (
    message,
    timeoutShow,
    timeoutHide,
    bannerType,
    showCloseButton,
    isHtmlAllowed
  ) => {
    return {
      params: {
        bannerText: getBannerText(message, bannerType),
        bannerType,
        showCloseButton,
        isHtmlAllowed
      },
      timeouts: getBannerTimeouts(message, timeoutShow, timeoutHide, bannerType)
    };
  };

  const hideBanner = () => {
    params.showBanner = false;
  };

  const showBanner = () => {
    params.showBanner = true;
  };

  // Used internally, omit validation
  const displayBanner = options => {
    // Hide first
    hideBanner();
    angular.extend(params, options.params);

    const { timeouts } = options;
    $timeout(() => {
      showBanner();
      if (timeouts.timeoutHide) {
        $timeout(hideBanner, timeouts.timeoutHide);
      }
    }, timeouts.timeoutShow);
  };

  const systemFeedbackService = {
    bannerTypes: allBannerType,
    setDefaultConfig(config) {
      const validatedConfig = validateConfig(config);
      angular.extend(defaultConfig, validatedConfig);
    },
    getDefaultConfig() {
      return defaultConfig;
    },
    getBindings() {
      return {
        params,
        closeBanner: hideBanner
      };
    },
    loading(message, timeoutShow, timeoutHide) {
      const options = buildBannerOptions(
        message,
        timeoutShow,
        timeoutHide,
        allBannerType.LOADING,
        false
      );
      displayBanner(options);
    },
    success(message, timeoutShow, timeoutHide) {
      const options = buildBannerOptions(
        message,
        timeoutShow,
        timeoutHide,
        allBannerType.SUCCESS,
        false
      );
      displayBanner(options);
    },
    warning(message, timeoutShow, timeoutHide) {
      const options = buildBannerOptions(
        message,
        timeoutShow,
        timeoutHide,
        allBannerType.WARNING,
        true
      );
      displayBanner(options);
    },
    clear() {
      $timeout(hideBanner());
    },
    openBanner(message, options) {
      const customOptions = buildBannerOptions(
        message,
        options.timeoutShow,
        options.timeoutHide,
        options.type,
        options.type === allBannerType.WARNING,
        options.isHtmlAllowed
      );
      displayBanner(customOptions);
    }
  };

  return systemFeedbackService;
}

systemFeedbackModule.factory('systemFeedbackService', systemFeedbackService);
export default systemFeedbackService;
