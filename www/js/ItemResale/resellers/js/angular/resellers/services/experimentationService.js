import { httpService } from 'core-utilities';
import experimentConstants from '../constants/experimentConstants';
import resellersModule from '../resellersModule';
import { CurrentUser } from 'Roblox';
import { localStorageService } from 'core-roblox-utilities';

function experimentationService() {
  const getLocalStorageShowTradeBtnKey = function () {
    const userId = CurrentUser.isAuthenticated && Number(CurrentUser.userId);
    if (!userId) return null;
    return `${experimentConstants.localStorageNames.showResellerTradeButton}:${userId}`;
  };

  const getLocalShouldShowResellerTradeBtn = function () {
    const key = getLocalStorageShowTradeBtnKey();
    if (!key) return null;
    return localStorageService.getLocalStorage(key) ?? null;
  };

  const setLocalShouldShowResellerTradeBtn = function (showResellerTradeButton) {
    const key = getLocalStorageShowTradeBtnKey();
    if (!key) return;
    localStorageService.setLocalStorage(key, showResellerTradeButton);
  };

  const getABTestEnrollment = function (projectId, layerName, parameters) {
    return httpService.get(
      experimentConstants.url.getExperimentationValues(projectId, layerName, parameters)
    );
  };

  const cacheBustAbEnrollment = async function () {
    // if the user has a boolean value in local storage, we are going to hit the
    // server to verify they are still in the experiment and overwrite the
    // localstorage value if not. This is so we can end the experiment if it has
    // negative consequences.
    const result = await getABTestEnrollment(
      experimentConstants.defaultProjectId,
      experimentConstants.layerNames.itemDetailsPage,
      experimentConstants.parameterNames.showResellerTradeButton
    );
    const showResellerTradeButton = result?.data?.showResellerTradeButton;

    // if this returns a non-boolean, then the user isn't part of the experiment
    if (typeof showResellerTradeButton !== 'boolean') {
      setLocalShouldShowResellerTradeBtn('');
    }
  };

  /*
    To prevent the trade buttons from abruptly popping in after the page has already
    loaded, we store the experiment result in LocalStorage for quicker lookup.
    We hit the backend regardless to remove the LocalStorage value if the user
    has been removed from the experiment (e.g. if we sunset the experiment)
  */
  const getShouldShowResellerTradeBtn = async function () {
    const localShowResellerBtn = getLocalShouldShowResellerTradeBtn();

    // if experiment is saved in Local Storage, use that value
    if (typeof localShowResellerBtn === 'boolean') {
      cacheBustAbEnrollment();
      return localShowResellerBtn;
    }

    const result = await getABTestEnrollment(
      experimentConstants.defaultProjectId,
      experimentConstants.layerNames.itemDetailsPage,
      experimentConstants.parameterNames.showResellerTradeButton
    );
    const showResellerTradeButton = result?.data?.showResellerTradeButton;

    // only set Local Storage if they are part of the experiment (if value is a boolean)
    if (typeof showResellerTradeButton === 'boolean') {
      setLocalShouldShowResellerTradeBtn(showResellerTradeButton);
    }
    return showResellerTradeButton;
  };

  return {
    getABTestEnrollment,
    getShouldShowResellerTradeBtn
  };
}
resellersModule.factory('experimentationService', experimentationService);

export default experimentationService;
