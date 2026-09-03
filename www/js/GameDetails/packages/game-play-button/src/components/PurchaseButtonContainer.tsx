import { ValidHttpUrl } from "@rbx/core-scripts/util/url";
import { Button, Loading } from "@rbx/core-ui/legacy/react-style-guide";
import { TranslateFunction, withTranslations } from "@rbx/core-scripts/legacy/react-utilities";
import { translations } from "../constants/translations";
import { PlayabilityStatus } from "../constants/playabilityStatus";
import usePurchaseProductData from "../hooks/usePurchaseProductData";
import {
  TGetProductDetails,
  TPlayabilityStatusPurchaseRequired,
  ValueOf,
  type TPlayButtonPageContext,
} from "../types/playButtonTypes";
import FiatPurchaseButton from "./FiatPurchaseButton";
import RobuxPurchaseButton from "./RobuxPurchaseButton";

enum PurchaseType {
  Robux = "Robux",
  Fiat = "Fiat",
}

const getPurchaseType = (
  playabilityStatus: TPlayabilityStatusPurchaseRequired,
  productDetails?: TGetProductDetails,
): PurchaseType => {
  if (
    playabilityStatus === PlayabilityStatus.FiatPurchaseRequired &&
    productDetails?.fiatPurchaseData
  ) {
    return PurchaseType.Fiat;
  }
  return PurchaseType.Robux;
};

export type TPurchaseButtonContainerProps = {
  universeId: string;
  placeId: string;
  iconClassName?: string;
  buttonWidth?: ValueOf<typeof Button.widths>;
  buttonClassName?: string;
  refetchPlayabilityStatus: () => void;
  hideButtonText?: boolean;
  redirectPurchaseUrl?: ValidHttpUrl;
  playabilityStatus: TPlayabilityStatusPurchaseRequired;
  showDefaultPurchaseText?: boolean;
  pageContext: TPlayButtonPageContext;
};

export const PurchaseButtonContainer = ({
  translate,
  universeId,
  placeId,
  iconClassName = "icon-robux-white",
  buttonWidth = Button.widths.full,
  buttonClassName = "btn-economy-robux-white-lg",
  refetchPlayabilityStatus,
  hideButtonText = false,
  redirectPurchaseUrl,
  playabilityStatus,
  showDefaultPurchaseText = false,
  pageContext,
}: TPurchaseButtonContainerProps & {
  translate: TranslateFunction;
}): React.JSX.Element => {
  const { productInfo, productDetails, isLoading } = usePurchaseProductData(universeId, placeId);

  if (isLoading) {
    return <Loading />;
  }

  return getPurchaseType(playabilityStatus, productDetails) === PurchaseType.Fiat ? (
    <FiatPurchaseButton
      universeId={universeId}
      placeId={placeId}
      iconClassName={iconClassName}
      buttonWidth={buttonWidth}
      buttonClassName={buttonClassName}
      hideButtonText={hideButtonText}
      redirectPurchaseUrl={redirectPurchaseUrl}
      productDetails={productDetails}
      translate={translate}
      showDefaultPurchaseText={showDefaultPurchaseText}
      pageContext={pageContext}
    />
  ) : (
    <RobuxPurchaseButton
      universeId={universeId}
      iconClassName={iconClassName}
      buttonWidth={buttonWidth}
      buttonClassName={buttonClassName}
      hideButtonText={hideButtonText}
      redirectPurchaseUrl={redirectPurchaseUrl}
      productDetails={productDetails}
      productInfo={productInfo}
      translate={translate}
      refetchPlayabilityStatus={refetchPlayabilityStatus}
    />
  );
};

export default withTranslations<TPurchaseButtonContainerProps>(
  PurchaseButtonContainer,
  translations,
);
