import React, { useState } from "react";
import { Dropdown } from "@rbx/core-ui/legacy/react-style-guide";
import { useTranslations } from "../util/translation";

export enum BrazilReportOption {
  ECA = "eca",
  INTIMATE_CONTENT = "intimate-content",
  WOMEN_SAFETY = "women-safety",
  UNLAWFUL_ADS = "unlawful-ads",
}

export interface BrazilReportSelectorProps {
  onSelectionChange: (option: BrazilReportOption) => void;
}

interface ReportOptionItem {
  value: BrazilReportOption;
  label: string;
  helper: string;
}

interface LocalizedReportOption {
  value: BrazilReportOption;
  labelKey: string;
  helperKey: string;
}

const localizedReportOptions: LocalizedReportOption[] = [
  {
    value: BrazilReportOption.ECA,
    labelKey: "Label.BrazilSelector.ECA",
    helperKey: "Message.BrazilSelector.Helper.ECA",
  },
  {
    value: BrazilReportOption.INTIMATE_CONTENT,
    labelKey: "Label.BrazilSelector.IntimateContent",
    helperKey: "Message.BrazilSelector.Helper.IntimateContent",
  },
  {
    value: BrazilReportOption.WOMEN_SAFETY,
    labelKey: "Label.BrazilSelector.WomenSafety",
    helperKey: "Message.BrazilSelector.Helper.WomenSafety",
  },
  {
    value: BrazilReportOption.UNLAWFUL_ADS,
    labelKey: "Label.BrazilSelector.UnlawfulAds",
    helperKey: "Message.BrazilSelector.Helper.UnlawfulAds",
  },
];

/**
 * Top-level Brazil ICR selector: ECA, intimate-content, women-safety, or
 * unlawful ads. Selecting an option mounts that form directly.
 */
const BrazilReportSelector: React.FC<BrazilReportSelectorProps> = ({ onSelectionChange }) => {
  const { translate } = useTranslations();
  const [selectedOption, setSelectedOption] = useState<ReportOptionItem | null>(null);

  const reportOptions: ReportOptionItem[] = localizedReportOptions.map(option => ({
    value: option.value,
    label: translate(option.labelKey),
    helper: translate(option.helperKey),
  }));

  const handleOptionSelect = (option: ReportOptionItem) => {
    setSelectedOption(option);
    onSelectionChange(option.value);
  };

  const getDisplayLabel = (): string => {
    if (selectedOption) {
      return selectedOption.label;
    }
    return translate("Label.BrazilSelector.PleaseSelect");
  };

  return (
    <div className="form-container">
      <div className="section">
        <h1>{translate("Title.BrazilSelector")}</h1>
        <p>{translate("Message.BrazilSelector.Description")}</p>
      </div>

      <div className="main-card">
        <h5>{translate("Label.BrazilSelector.SelectReportType")}</h5>
        <div className="rbx-select-group">
          <Dropdown
            id="brazil-report-selector"
            className="input-group-btn"
            currSelectionLabel={getDisplayLabel()}
          >
            {reportOptions.map(option => (
              <Dropdown.Item
                key={option.value}
                onSelect={() => handleOptionSelect(option)}
                active={selectedOption?.value === option.value}
              >
                <span className="brazil-report-option">
                  <span className="brazil-report-option__label">{option.label}</span>
                  <span className="brazil-report-option__helper">{option.helper}</span>
                </span>
              </Dropdown.Item>
            ))}
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default BrazilReportSelector;
