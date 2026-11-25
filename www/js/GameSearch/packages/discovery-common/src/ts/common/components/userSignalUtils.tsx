import { fireEvent } from "@rbx/www-common/event-tracker";
import bedev2Services from "../services/bedev2Services";
import { userSignal } from "../constants/configConstants";
import {
  TUserSignalAssetType,
  TUserSignalEntity,
  TUserSignalProductSurface,
  TUserSignalType,
  TUserSignalValue,
  TUserSignalValueType,
} from "../types/userSignalTypes";
import { PageContext } from "../types/pageContext";

export const getProductSurface = (page?: PageContext): TUserSignalProductSurface | undefined => {
  if (!page) {
    fireEvent(userSignal.ExplicitFeedbackMissingAppPageCounterEvent);
    return undefined;
  }

  switch (page) {
    case PageContext.HomePage:
      return TUserSignalProductSurface.Home;
    default:
      fireEvent(userSignal.ExplicitFeedbackUnexpectedAppPageCounterEvent);
      return undefined;
  }
};

const NotInterestedFeedbackFormId = {
  NotInterestedFeedback1: "NotInterestedFeedback1",
};

const NotInterestedFeedbackFormTitleId = {
  WhyHideExperience: "WhyHideExperience",
};

const buildNotInterestedFeedbackResponse = (
  selectedValues: { [key: string]: boolean },
  text: string,
): string =>
  JSON.stringify({
    formId: NotInterestedFeedbackFormId.NotInterestedFeedback1,
    titleId: NotInterestedFeedbackFormTitleId.WhyHideExperience,
    textResponse: text,
    items: Object.keys(selectedValues).map(value => ({
      id: value,
      selected: selectedValues[value] || false,
    })),
  });

type TGameTileUserSignalParams = {
  universeId: string;
  topicId: string | undefined;
  isSponsored: boolean | undefined;
  page: PageContext | undefined;
  pageSession: string;
  onFailure: () => void;
};

/**
 * Posts a game tile user signal. Calls `onFailure` when the page has no product
 * surface, the tile has no topic id, or the request fails.
 */
const sendGameTileUserSignal = (
  { universeId, topicId, isSponsored, page, pageSession, onFailure }: TGameTileUserSignalParams,
  value: TUserSignalValue,
  valueType: TUserSignalValueType,
  signalType: TUserSignalType,
): void => {
  const productSurface = getProductSurface(page);
  if (!productSurface) {
    onFailure();
    return;
  }

  if (!topicId) {
    onFailure();
    fireEvent(userSignal.ExplicitFeedbackMissingTopicIdCounterEvent);
    return;
  }

  const signalEntity: TUserSignalEntity = {
    id: universeId,
    assetType: isSponsored ? TUserSignalAssetType.SponsoredGame : TUserSignalAssetType.Game,
    signalOrigin: {
      productSurface,
      topicId,
      subIds: [topicId],
    },
  };

  bedev2Services
    .postUserSignal(value, valueType, signalEntity, signalType, pageSession)
    .catch(() => {
      onFailure();
      fireEvent(userSignal.ExplicitFeedbackUserSignalFailedCounterEvent);
    });
};

/**
 * Posts a NotInterested user signal: true marks the game not interested, false
 * undoes it. Shared by legacy and SDUI game tiles.
 */
export const sendNotInterestedUserSignal = (
  params: TGameTileUserSignalParams & { isNotInterested: boolean },
): void =>
  sendGameTileUserSignal(
    params,
    { boolValue: params.isNotInterested },
    TUserSignalValueType.Bool,
    TUserSignalType.NotInterested,
  );

/**
 * Posts the not interested feedback form's answers as a NotInterestedFeedback
 * user signal. Shared by legacy and SDUI game tiles.
 */
export const sendNotInterestedFeedbackUserSignal = (
  params: TGameTileUserSignalParams & {
    selectedValues: { [key: string]: boolean };
    text: string;
  },
): void =>
  sendGameTileUserSignal(
    params,
    { stringValue: buildNotInterestedFeedbackResponse(params.selectedValues, params.text) },
    TUserSignalValueType.String,
    TUserSignalType.NotInterestedFeedback,
  );

export default {
  getProductSurface,
};
