import React, { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TranslationProvider } from '../util/translation';
import IllegalContentReportForm from './IllegalContentReportForm';
import IllegalContentReportAppealForm from './illegalContentReportAppealForm';
import UKReportSelector, { UKReportOption } from './UKReportSelector';
import OSAComplaintsSelector from './OSAComplaintsSelector';
import OSAComplaintsForm from './OSAComplaintsForm';
import { dsaTranslationConfig } from '../../../translation.config';
import '../style/shared.scss';
import './style.scss';
import { ReportType } from './helpers';

const queryClient = new QueryClient();

interface OSAComplaintsFlowProps {
  /** Currently selected OSA complaint type */
  selectedOSAComplaintType: string | null;
  /** Callback when an OSA complaint type is selected */
  onSelectionChange: (complaintType: string) => void;
  /** Callback for back navigation */
  onBack: () => void;
}

/**
 * Handles the OSA complaints sub-flow (selector → specific complaint form).
 * Renders either the OSA complaints selector or the specific complaint form based on selection.
 */
const OSAComplaintsFlow = ({
  selectedOSAComplaintType,
  onSelectionChange,
  onBack
}: OSAComplaintsFlowProps): React.ReactElement => {
  if (!selectedOSAComplaintType) {
    // Step 2a: Show OSA complaints selector
    return <OSAComplaintsSelector onSelectionChange={onSelectionChange} onBack={onBack} />;
  }
  // Step 2b: Show specific OSA complaint form
  return <OSAComplaintsForm complaintType={selectedOSAComplaintType} onBack={onBack} />;
};

interface UKUserFlowProps {
  /** Currently selected UK report option */
  selectedUKOption: UKReportOption | null;
  /** Currently selected OSA complaint type */
  selectedOSAComplaintType: string | null;
  /** Default content URL from query params */
  contentURLParam: string | null;
  /** Callback when a UK option is selected */
  onUKOptionSelection: (option: UKReportOption) => void;
  /** Callback when an OSA complaint type is selected */
  onOSAComplaintSelection: (complaintType: string) => void;
  /** Callback for back navigation */
  onBack: () => void;
}

/**
 * Handles the multi-step flow for UK users.
 * Renders the appropriate component based on the current selection state.
 */
const UKUserFlow = ({
  selectedUKOption,
  selectedOSAComplaintType,
  contentURLParam,
  onUKOptionSelection,
  onOSAComplaintSelection,
  onBack
}: UKUserFlowProps): React.ReactElement => {
  if (!selectedUKOption) {
    // Step 1: Show UK selector
    return <UKReportSelector onSelectionChange={onUKOptionSelection} />;
  }

  // Step 2: Show selected form based on UK option
  switch (selectedUKOption) {
    case UKReportOption.ILLEGAL_CONTENT:
      return (
        <IllegalContentReportForm
          reportType={ReportType.OSA}
          defaultContentURL={contentURLParam}
          onBack={onBack}
        />
      );
    case UKReportOption.HARMFUL_TO_CHILDREN:
      return (
        <IllegalContentReportForm
          reportType={ReportType.CHCR}
          defaultContentURL={contentURLParam}
          onBack={onBack}
        />
      );
    case UKReportOption.OSA_COMPLAINTS:
      return (
        <OSAComplaintsFlow
          selectedOSAComplaintType={selectedOSAComplaintType}
          onSelectionChange={onOSAComplaintSelection}
          onBack={onBack}
        />
      );
    default:
      return <UKReportSelector onSelectionChange={onUKOptionSelection} />;
  }
};

interface ReportContentProps {
  /** Whether the current user is from the UK */
  isUKUser: boolean;
  /** Appeal parameter from query string */
  appealParam: string | null;
  /** Case ID parameter from query string */
  caseIDParam: string | null;
  /** Content URL parameter from query string */
  contentURLParam: string | null;
  /** Currently selected UK report option */
  selectedUKOption: UKReportOption | null;
  /** Currently selected OSA complaint type */
  selectedOSAComplaintType: string | null;
  /** Callback when a UK option is selected */
  onUKOptionSelection: (option: UKReportOption) => void;
  /** Callback when an OSA complaint type is selected */
  onOSAComplaintSelection: (complaintType: string) => void;
  /** Callback for back navigation */
  onBack: () => void;
}

/**
 * Renders the appropriate content based on user type and query parameters.
 * Handles appeals, UK user flow, and EU user flow.
 */
const ReportContent = ({
  isUKUser,
  appealParam,
  caseIDParam,
  contentURLParam,
  selectedUKOption,
  selectedOSAComplaintType,
  onUKOptionSelection,
  onOSAComplaintSelection,
  onBack
}: ReportContentProps): React.ReactElement => {
  // Handle appeals first (same for all report types)
  if (appealParam && appealParam === 'true') {
    return (
      <IllegalContentReportAppealForm reportType={ReportType.OSA} defaultCaseID={caseIDParam} />
    );
  }

  // For UK users, show multi-step flow
  if (isUKUser) {
    return (
      <UKUserFlow
        selectedUKOption={selectedUKOption}
        selectedOSAComplaintType={selectedOSAComplaintType}
        contentURLParam={contentURLParam}
        onUKOptionSelection={onUKOptionSelection}
        onOSAComplaintSelection={onOSAComplaintSelection}
        onBack={onBack}
      />
    );
  }

  // For EU users, show standard DSA form
  return (
    <IllegalContentReportForm reportType={ReportType.DSA} defaultContentURL={contentURLParam} />
  );
};

/**
 * Props for the IllegalContentReportApp component
 */
export interface Props {
  /** Whether the current user is from the UK (determines available report options) */
  isUKUser: boolean;
}

/**
 * Main application component for illegal content reporting.
 * Handles navigation between different report types and forms based on user location.
 *
 * ## User Flow Hierarchy:
 *
 * ### EU Users (Non-UK):
 * ```
 * EU User → ICR Form (Illegal Content Report Form)
 * ```
 *
 * ### UK Users:
 * ```
 * UK User → UK Selector
 *         ├── OSA ICR Form (OSA Illegal Content Report)
 *         ├── CHCR Form (Content Harmful to Children Report)
 *         └── Online Safety Act Complaints Selector (OSA Complaints Selector)
 *             ├── Illegal Content Takedown
 *             ├── Terms of Service
 *             ├── CHCR Subcategory
 *             ├── Content Reporting Duties
 *             ├── Freedom of Expression and Privacy
 *             └── Proactive Technology
 * ```
 *
 * ## Navigation Flow:
 * - **Back from OSA Complaint Forms** → OSA Complaints Selector
 * - **Back from OSA Complaints Selector** → UK Selector
 * - **Back from other forms** → UK Selector
 */
const IllegalContentReportApp = ({ isUKUser }: Props): React.ReactElement => {
  const queryParams = new URLSearchParams(window.location.search);
  const appealParam = queryParams.get('appeal');
  const caseIDParam = queryParams.get('caseID');
  const contentURLParam = queryParams.get('contentURL');

  // State for UK multi-step flow
  const [selectedUKOption, setSelectedUKOption] = useState<UKReportOption | null>(null);
  const [selectedOSAComplaintType, setSelectedOSAComplaintType] = useState<string | null>(null);

  const handleUKOptionSelection = (option: UKReportOption) => {
    setSelectedUKOption(option);
  };

  /**
   * Handles back navigation through the form hierarchy.
   * See component documentation above for complete navigation flow diagram.
   */
  const onBack = useCallback(() => {
    if (selectedOSAComplaintType !== null) {
      // From OSA complaint form back to OSA selector
      setSelectedOSAComplaintType(null);
    } else {
      // From any selector back to UK selector (or exit if already there)
      setSelectedUKOption(null);
    }
  }, [selectedOSAComplaintType, setSelectedOSAComplaintType, setSelectedUKOption]);

  return (
    <TranslationProvider translationConfig={dsaTranslationConfig}>
      <QueryClientProvider client={queryClient}>
        <div id='generic-challenge-container' />
        <ReportContent
          isUKUser={isUKUser}
          appealParam={appealParam}
          caseIDParam={caseIDParam}
          contentURLParam={contentURLParam}
          selectedUKOption={selectedUKOption}
          selectedOSAComplaintType={selectedOSAComplaintType}
          onUKOptionSelection={handleUKOptionSelection}
          onOSAComplaintSelection={setSelectedOSAComplaintType}
          onBack={onBack}
        />
      </QueryClientProvider>
    </TranslationProvider>
  );
};

export default IllegalContentReportApp;
