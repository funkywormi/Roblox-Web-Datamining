import React, { useState, useCallback } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@rbx/core-scripts/react";
import { TranslationProvider } from "../util/translation";
import BrazilECAForm from "./BrazilECAForm";
import BrazilReportSelector, { BrazilReportOption } from "./BrazilReportSelector";
import BrazilWomenIntimateForm from "./BrazilWomenIntimateForm";
import BrazilWomenSafetyForm from "./BrazilWomenSafetyForm";
import BrazilAdsForm from "./BrazilAdsForm";
import { dsaTranslationConfig } from "../../../translation.config";
import "../style/shared.scss";
import "./style.scss";

interface BrazilReportFlowProps {
  selectedOption: BrazilReportOption | null;
  contentURLParam: string | null;
  onSelection: (option: BrazilReportOption) => void;
  onBack: () => void;
}

/**
 * Brazil ICR flow: selector (ECA / intimate / women-safety / unlawful ads), then the form.
 */
export const BrazilReportFlow = ({
  selectedOption,
  contentURLParam,
  onSelection,
  onBack,
}: BrazilReportFlowProps): React.ReactElement => {
  if (!selectedOption) {
    return <BrazilReportSelector onSelectionChange={onSelection} />;
  }

  switch (selectedOption) {
    case BrazilReportOption.ECA:
      return <BrazilECAForm defaultContentURL={contentURLParam} onBack={onBack} />;
    case BrazilReportOption.INTIMATE_CONTENT:
      return <BrazilWomenIntimateForm defaultContentURL={contentURLParam} onBack={onBack} />;
    case BrazilReportOption.WOMEN_SAFETY:
      return <BrazilWomenSafetyForm defaultContentURL={contentURLParam} onBack={onBack} />;
    case BrazilReportOption.UNLAWFUL_ADS:
      return <BrazilAdsForm defaultContentURL={contentURLParam} onBack={onBack} />;
    default:
      return <BrazilReportSelector onSelectionChange={onSelection} />;
  }
};

/**
 * Application component for Brazil users' illegal content reporting.
 * Starts at the report-type selector, then routes to the selected form.
 */
const BrazilApp = (): React.ReactElement => {
  const queryParams = new URLSearchParams(window.location.search);
  const contentURLParam = queryParams.get("contentURL");
  const [selectedOption, setSelectedOption] = useState<BrazilReportOption | null>(null);

  const handleSelection = (option: BrazilReportOption) => {
    setSelectedOption(option);
  };

  const handleBack = useCallback(() => {
    setSelectedOption(null);
  }, []);

  return (
    <TranslationProvider translationConfig={dsaTranslationConfig}>
      <QueryClientProvider client={queryClient}>
        <div id="generic-challenge-container" />
        <BrazilReportFlow
          selectedOption={selectedOption}
          contentURLParam={contentURLParam}
          onSelection={handleSelection}
          onBack={handleBack}
        />
      </QueryClientProvider>
    </TranslationProvider>
  );
};

export default BrazilApp;
