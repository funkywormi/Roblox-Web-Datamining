import React, { Fragment, useRef, useEffect } from "react";
import { TSystemFeedbackService } from "react-style-guide";
import { TranslateFunction } from "react-utilities";
import {
  HeuristicCreditConversionContext,
  useHeuristicCreditConversionData,
} from "../store/HeuristicCreditConversionContext";
import type { Address } from "@rbx/payments/billingAddress";
import PurchasePackageModal from "../components/HeuristicConvertedToCredit/PurchasePackageModal";
import ConvertCreditModal from "../components/HeuristicConvertedToCredit/ConvertCreditModal";

type HeuristicCreditConversionModalProps = {
  systemFeedbackService: TSystemFeedbackService;
  translate: TranslateFunction;
  onSuccess?: (isCreditConversion: boolean) => void;
};

function useHeuristicCreditConversionModal({
  systemFeedbackService,
  translate,
  onSuccess,
}: HeuristicCreditConversionModalProps): [React.FC, (address?: Address) => void] {
  const startFlowRef = useRef<((address?: Address) => void) | null>(null);

  // Component that renders modals and captures the Context function
  const ModalController = (): JSX.Element => {
    const { startCreditConversionFlow } = useHeuristicCreditConversionData();

    // Capture the Context function in the ref
    useEffect(() => {
      startFlowRef.current = startCreditConversionFlow;
    }, [startCreditConversionFlow]);

    return (
      <Fragment>
        <PurchasePackageModal />
        <ConvertCreditModal />
      </Fragment>
    );
  };

  const HeuristicCreditConversionModalWithContext = (): JSX.Element => {
    return (
      <HeuristicCreditConversionContext
        systemFeedbackService={systemFeedbackService}
        translate={translate}
        onSuccess={onSuccess}
      >
        <ModalController />
      </HeuristicCreditConversionContext>
    );
  };

  const startCreditConversionFlow = (address?: Address) => {
    startFlowRef.current?.(address);
  };

  return [HeuristicCreditConversionModalWithContext, startCreditConversionFlow];
}

export default useHeuristicCreditConversionModal;
