import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import ShopGiftcardsPageContainer from "./components/ShopGiftcardsPage";

const translationConfig = {
  common: [],
  feature: "Feature.SponsoredPages",
};

function App({ translate, intl }: WithTranslationsProps): JSX.Element {
  return <ShopGiftcardsPageContainer translate={translate} intl={intl} />;
}

export default withTranslations(App, translationConfig);
