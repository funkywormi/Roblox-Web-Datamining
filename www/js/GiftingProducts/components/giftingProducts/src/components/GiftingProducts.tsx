import { FC } from "react";
import classNames from "classnames";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import useGiftingProducts, { GiftingProductsStep } from "../hooks/useGiftingProducts";
import { translationConfig } from "../translation.config";
import GiftingProductsHeader from "./GiftingProductsHeader";
import GiftingProductsIntro from "./GiftingProductsIntro";
import GiftingProductsCheckout from "./GiftingProductsCheckout";
import GiftingProductsLegalDisclosure from "./GiftingProductsLegalDisclosure";
import RobuxPhoneVerificationModal from "./RobuxPhoneVerificationModal";
import RobuxErrorModal from "./RobuxErrorModal";

type GiftingProductsProps = {} & WithTranslationsProps;

const GiftingProducts: FC<GiftingProductsProps> = ({ translate }) => {
  const {
    showPhoneVerification,
    productId,
    products,
    isUserEligible,
    isUserLoading,
    step,
    robuxErrorType,
    userId,
    userName,
    displayName,
    message,
    messages,
    isSearchOpened,
    showSearchButton,
    legalDisclosureTranslationKey,
    onReport,
    onNavigateToCheckout,
    onSelectProduct,
    onSelectMessage,
    onCheckout,
    onPhoneVerificationClose,
    onRobuxErrorClose,
    onChangeUserId,
    onOpenSearch,
  } = useGiftingProducts({ translate });

  let content;
  switch (step) {
    case GiftingProductsStep.INTRO: {
      content = <GiftingProductsIntro />;
      break;
    }
    case GiftingProductsStep.CHECKOUT: {
      content = (
        <GiftingProductsCheckout
          products={products}
          productId={productId}
          message={message}
          messages={messages}
          onSelectProduct={onSelectProduct}
          onSelectMessage={onSelectMessage}
          onCheckout={onCheckout}
        />
      );
      break;
    }
    default: {
      content = null;
      break;
    }
  }

  return (
    <div
      className={classNames("gifting-products-container", {
        "gifting-products-container-intro": step === GiftingProductsStep.INTRO,
        "gifting-products-container-checkout": step === GiftingProductsStep.CHECKOUT,
      })}
    >
      <div className="gifting-products-wrapper">
        <GiftingProductsHeader
          isUserEligible={isUserEligible}
          isUserLoading={isUserLoading}
          step={step}
          errorType={robuxErrorType}
          userId={userId}
          userName={userName}
          displayName={displayName}
          onReport={onReport}
          onNextStep={onNavigateToCheckout}
          onChangeUserId={onChangeUserId}
          onOpenSearch={onOpenSearch}
          isSearchOpened={isSearchOpened}
          showSearchButton={showSearchButton}
        />
        {content}
        <GiftingProductsLegalDisclosure
          legalDisclosureTranslationKey={legalDisclosureTranslationKey}
        />
        <RobuxPhoneVerificationModal
          show={showPhoneVerification}
          onClose={onPhoneVerificationClose}
        />
        {robuxErrorType && (
          <RobuxErrorModal errorType={robuxErrorType} onClose={onRobuxErrorClose} />
        )}
      </div>
    </div>
  );
};
export default withTranslations(GiftingProducts, translationConfig);
