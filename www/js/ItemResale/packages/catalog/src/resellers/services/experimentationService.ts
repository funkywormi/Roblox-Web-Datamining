import { httpService } from "core-utilities";
import { localStorageService } from "core-roblox-utilities";
import { isAuthenticated, userId } from "@rbx/core-scripts/meta/user";
import experimentConstants from "../constants/experimentConstants";

type TExperimentValues = {
  showResellerTradeButton?: unknown;
};

const getLocalStorageShowTradeBtnKey = (): string | null => {
  const currentUserId = isAuthenticated() && Number(userId());
  if (!currentUserId) {
    return null;
  }
  return `${experimentConstants.localStorageNames.showResellerTradeButton}:${currentUserId}`;
};

const getLocalShouldShowResellerTradeBtn = (): unknown => {
  const key = getLocalStorageShowTradeBtnKey();
  if (!key) {
    return null;
  }
  return localStorageService.getLocalStorage(key) ?? null;
};

const setLocalShouldShowResellerTradeBtn = (showResellerTradeButton: boolean | string): void => {
  const key = getLocalStorageShowTradeBtnKey();
  if (!key) {
    return;
  }
  localStorageService.setLocalStorage(key, showResellerTradeButton);
};

const getABTestEnrollment = () =>
  httpService.get<TExperimentValues>(
    experimentConstants.url.getExperimentationValues(
      experimentConstants.defaultProjectId,
      experimentConstants.layerNames.itemDetailsPage,
      experimentConstants.parameterNames.showResellerTradeButton,
    ),
  );

// The experiment result is cached in localStorage so the trade buttons do not pop in after load. The
// server is still asked on every load so the value can be cleared when the experiment is sunset.
const cacheBustAbEnrollment = async (): Promise<void> => {
  const result = await getABTestEnrollment();
  const showResellerTradeButton = result?.data?.showResellerTradeButton;

  if (typeof showResellerTradeButton !== "boolean") {
    setLocalShouldShowResellerTradeBtn("");
  }
};

const getShouldShowResellerTradeBtn = async (): Promise<boolean | undefined> => {
  const localShowResellerBtn = getLocalShouldShowResellerTradeBtn();

  if (typeof localShowResellerBtn === "boolean") {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- matches the Angular call, which does not await
    cacheBustAbEnrollment();
    return localShowResellerBtn;
  }

  const result = await getABTestEnrollment();
  const showResellerTradeButton = result?.data?.showResellerTradeButton;

  if (typeof showResellerTradeButton === "boolean") {
    setLocalShouldShowResellerTradeBtn(showResellerTradeButton);
  }
  return showResellerTradeButton as boolean | undefined;
};

export const experimentationService = {
  getABTestEnrollment,
  getShouldShowResellerTradeBtn,
};

export default experimentationService;
