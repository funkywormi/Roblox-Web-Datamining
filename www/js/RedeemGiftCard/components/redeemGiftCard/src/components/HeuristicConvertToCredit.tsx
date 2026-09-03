/* eslint no-void: ["error", { "allowAsStatement": true }] */
import React, { useEffect, useState } from "react";
import { TSystemFeedbackService } from "react-style-guide";
import { TranslateFunction } from "@rbx/core-scripts/react";
import {
  getRedeemGiftCardConversionMetadata,
  TRANSLATION_KEYS,
  trackCounter,
} from "@rbx/payments/creditCheckout";
import ContainerHeader from "./HeuristicConvertedToCredit/ContainerHeader";
import ContainerFooter from "./HeuristicConvertedToCredit/ContainerFooter";
import useGetPlusProducts from "../hooks/useGetPlusProducts";

export type THeuristicConvertToCreditProps = {
  creditBalance: number;
  setCreditBalance: (creditBalance: number) => void;
  currencyCode: string;
  setCurrencyCode: (currencyCode: string) => void;
  convertedRobuxAmount: number;
  setConvertedRobuxAmount: (robuxAmount: number) => void;
  systemFeedbackService: TSystemFeedbackService; // pass in to avoid the system feedback component is hidden due this component is hidden
  translate: TranslateFunction;
  autoOpenGetPlusModal?: boolean;
  onGetPlusModalAutoOpened?: () => void;
  onGetPlusModalAutoOpenFailed?: () => void;
  preferredGetPlusSubscriptionTargetKey?: string;
};

function HeuristicConvertToCredit({
  creditBalance,
  setCreditBalance,
  currencyCode,
  setCurrencyCode,
  convertedRobuxAmount,
  setConvertedRobuxAmount,
  systemFeedbackService,
  translate,
  autoOpenGetPlusModal = false,
  onGetPlusModalAutoOpened,
  onGetPlusModalAutoOpenFailed,
  preferredGetPlusSubscriptionTargetKey,
}: THeuristicConvertToCreditProps) {
  const [isConvertAllFlowEnabled, setIsConvertAllFlowEnabled] = useState(false);

  const fetchCreditBalance = async () => {
    const getConversionMetadataResponse = await getRedeemGiftCardConversionMetadata();
    if (getConversionMetadataResponse.status !== 200) {
      trackCounter("GetConversionMetadata_Failed", {
        statusCode: String(getConversionMetadataResponse.status) || "unknown",
      });
      return;
    }

    const conversionMetadata = getConversionMetadataResponse.data;
    setConvertedRobuxAmount(conversionMetadata.robuxConversionAmount);
    setCurrencyCode(conversionMetadata.currencyCode);
    setCreditBalance(conversionMetadata.creditBalance);
    setIsConvertAllFlowEnabled(conversionMetadata.isConvertAllFlowEnabled);
  };

  // This runs once initially, and everytime credit balance changes to get new credit value
  useEffect(() => {
    void fetchCreditBalance();
  }, [creditBalance]);

  const { products: plusProducts, isLoading: isLoadingPlusProducts } = useGetPlusProducts();

  if (creditBalance < 0 || !currencyCode || currencyCode.length !== 3) {
    return null;
  }

  if (creditBalance > 0) {
    return (
      <div className="convert-credit-container-with-background">
        <ContainerHeader
          creditBalance={creditBalance}
          currencyCode={currencyCode}
          convertedRobuxAmount={convertedRobuxAmount}
          translate={translate}
        />
        <div
          className="convert-credit-description"
          dangerouslySetInnerHTML={{
            __html: translate(TRANSLATION_KEYS.EnjoyUpToTwentyFivePercentMoreRobuxLabel, {
              boldStart: "<b>",
              boldEnd: "</b>",
            }),
          }}
        />
        <ContainerFooter
          convertedRobuxAmount={convertedRobuxAmount}
          creditBalance={creditBalance}
          currencyCode={currencyCode}
          systemFeedbackService={systemFeedbackService}
          isConvertAllFlowEnabled={isConvertAllFlowEnabled}
          translate={translate}
          plusProducts={plusProducts}
          isLoadingPlusProducts={isLoadingPlusProducts}
          autoOpenGetPlusModal={autoOpenGetPlusModal}
          onGetPlusModalAutoOpened={onGetPlusModalAutoOpened}
          onGetPlusModalAutoOpenFailed={onGetPlusModalAutoOpenFailed}
          preferredGetPlusSubscriptionTargetKey={preferredGetPlusSubscriptionTargetKey}
        />
      </div>
    );
  }

  return (
    <div className="convert-credit-container">
      <ContainerHeader
        creditBalance={creditBalance}
        currencyCode={currencyCode}
        convertedRobuxAmount={convertedRobuxAmount}
        translate={translate}
      />
    </div>
  );
}

export default HeuristicConvertToCredit;
