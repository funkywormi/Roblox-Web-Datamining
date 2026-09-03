import phoneValidationModule from '../phoneValidationModule';

/**
 * @ngdoc filter
 * @name phone-number
 * @kind function
 *
 * @description
 * filters a user typed phone number into a formatted number
 *
 */
function phoneNumberFormat($log, $window) {
  'ngInject';

  function clearValue(value) {
    if (!value) {
      return value;
    }
    return value.replace(/([^0-9|+])/g, '');
  }

  function applyPhoneMask(value, region) {
    let phoneMask = value;
    try {
      phoneMask = $window.phoneUtils.formatAsTyped(value, region);
    } catch (err) {
      $log.debug(err);
    }
    return phoneMask;
  }

  return {
    restrict: 'A',
    require: '?ngModel',
    scope: {
      countryCode: '=',
      nonFormatted: '=?'
    },
    controllerAs: '',
    controller() {
      this.countryCode = this.countryCode || 'us';
    },
    link(scope, element, attrs, ctrl) {
      const el = element[0];
      scope.$watch('countryCode', function() {
        ctrl.$modelValue = `${ctrl.$viewValue} `;
      });

      function clean(value) {
        const cleanValue = clearValue(value);
        scope.nonFormatted = cleanValue;
        let formattedValue = '';
        if (cleanValue && cleanValue.length > 1) {
          formattedValue = applyPhoneMask(cleanValue, scope.countryCode);
        } else {
          formattedValue = cleanValue;
        }
        return formattedValue.trim();
      }

      function formatter(value) {
        if (ctrl.$isEmpty(value)) {
          return value;
        }
        return applyPhoneMask(clearValue(value), scope.countryCode);
      }

      function parser(value) {
        if (ctrl.$isEmpty(value)) {
          scope.nonFormatted = '';
          return value;
        }

        const formattedValue = clean(value);
        if (formattedValue === value) {
          return value;
        }
        let start = el.selectionStart;
        let end = el.selectionEnd + formattedValue.length - value.length;

        if (value.length < formattedValue.length) {
          // shift the start by the difference
          start += formattedValue.length - value.length;
        }

        if (value.length > formattedValue.length + 1) {
          if (end < 0) {
            start += 1;
            end = start;
          } else {
            start -= formattedValue.length - value.length;
          }
        }
        // element.val(cleaned) does not behave with
        // repeated invalid elements
        ctrl.$setViewValue(formattedValue);
        ctrl.$render();

        el.setSelectionRange(start, end);
        // return cleaned;
        return clearValue(formattedValue);
      }

      ctrl.$formatters.push(formatter);
      ctrl.$parsers.push(parser);
    }
  };
}

phoneValidationModule.directive('phoneNumberFormat', phoneNumberFormat);

export default phoneNumberFormat;
