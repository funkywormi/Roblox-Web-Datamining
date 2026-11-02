import { fireEvent } from "@rbx/www-common/event-tracker";
import { userSignal } from "../constants/configConstants";
import { TUserSignalProductSurface } from "../types/userSignalTypes";
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

export default {
  getProductSurface,
};
