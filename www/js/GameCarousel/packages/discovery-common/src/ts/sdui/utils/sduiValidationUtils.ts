import { PageContext } from "../../common/types/pageContext";
import { TSduiPageContextType } from "../system/SduiTypes";

export const isSupportedSduiPage = (
  pageContext: PageContext,
): pageContext is TSduiPageContextType => {
  if (
    pageContext === PageContext.HomePage ||
    pageContext === PageContext.GamesPage ||
    pageContext === PageContext.SpotlightPage
  ) {
    return true;
  }
  return false;
};

export default { isSupportedSduiPage };
