import Intl from "@rbx/core-scripts/intl";
import { landingPageContainer } from "../constants/browserConstants";

const intl = new Intl();
const locale = intl.getRobloxLocale();

// will add more to this file when doing landing page ui
export const getIsReactUIEnabled = (): boolean => {
  const entryPoint = landingPageContainer();
  const isReactUIEnabled = entryPoint?.getAttribute("data-enable-react-ui") === "true";
  return isReactUIEnabled;
};

// TODO Add support for more locales as we get the design assets.
export const getClassNameWithLocale = (className: string): string => {
  switch (locale) {
    case "ja_jp":
      return className.concat("-jp");
      break;

    default:
      return className;
      break;
  }
};
