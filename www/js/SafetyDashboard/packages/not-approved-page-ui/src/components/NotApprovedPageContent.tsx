import React, { useMemo } from "react";
import PageItemsFromConfigs from "../pageItemConfigs/PageItemsFromConfigs";
import NotApprovedDialogHeader from "./header/NotApprovedDialogHeader";
import NotApprovedCtaButtons from "./cta/NotApprovedCtaButtons";
import { LoadingSkeletonHeader, LoadingSkeletonBody, LoadingSkeletonCtas } from "./LoadingSkeleton";
import { ErrorMessageHeader, ErrorMessageBody } from "./ErrorMessage";
import { useNotApprovedPagePunishment } from "../context/NotApprovedPagePunishmentProvider";
import { useNotApprovedUIConfig } from "../providers/NotApprovedUIProvider";
import { PageNavigationProvider } from "../context/PageNavigationContext";
import { PageAnalyticsProvider } from "../context/PageAnalyticsContext";
import { generatePages } from "../pageItemConfigs/generatePages";
import POLICY_EDUCATION_CONTENT_REGISTRY from "../pageItemConfigs/educationalConfigs/policyEducationContentRegistry";

export interface NotApprovedPageContentSlots {
  header?: React.ReactElement;
  body: React.ReactElement;
  ctas?: React.ReactElement;
}

interface NotApprovedPageContentProps {
  onOpenChange: (isOpen: boolean) => void;
  children: (slots: NotApprovedPageContentSlots) => React.ReactElement;
}

/**
 * Render-prop component that centralizes all shared logic (data loading, page generation,
 * providers) and exposes `{ header, body, ctas }` slots. The Dialog consumes these slots and
 * arranges them in its own layout.
 */
const NotApprovedPageContent = ({
  onOpenChange,
  children,
}: NotApprovedPageContentProps): React.JSX.Element | null => {
  const { readOnly } = useNotApprovedUIConfig();
  const { punishmentData, violationReasons, isLoading, error, commutationEligibility } =
    useNotApprovedPagePunishment();

  const untranslatedReasons = violationReasons?.untranslatedReasons;
  const hasEducationalPages = useMemo(
    () => (untranslatedReasons ?? []).some(key => key in POLICY_EDUCATION_CONTENT_REGISTRY),
    [untranslatedReasons],
  );

  /**
   * Pages are derived here rather than in PageNavigationContext because generatePages imports
   * all of the page item configs. When any of the page items rely on a context value, it would
   * create a circular dependency cycle. To prevent that happening, we derive the pages here since
   * none of the page items would be importing this component.
   */
  const { pages, unmappedViolationKeys } = useMemo(() => {
    return !punishmentData
      ? { pages: [], unmappedViolationKeys: [] }
      : generatePages(punishmentData, untranslatedReasons ?? [], commutationEligibility, readOnly);
  }, [punishmentData, untranslatedReasons, commutationEligibility, readOnly]);

  if (isLoading) {
    return children({
      header: <LoadingSkeletonHeader readOnly={Boolean(readOnly)} />,
      body: <LoadingSkeletonBody />,
      ctas: <LoadingSkeletonCtas />,
    });
  }

  if (error || !punishmentData) {
    return children({
      header: <ErrorMessageHeader />,
      body: <ErrorMessageBody error={error} />,
    });
  }

  return (
    <PageNavigationProvider
      pages={pages}
      unmappedViolationKeys={unmappedViolationKeys}
      hasEducationalPages={hasEducationalPages}
      commutationEligibility={commutationEligibility}
    >
      <PageAnalyticsProvider>
        {children({
          header: <NotApprovedDialogHeader punishmentData={punishmentData} />,
          body: (
            <PageItemsFromConfigs
              punishmentData={punishmentData}
              commutationEligibility={commutationEligibility}
            />
          ),
          ctas: (
            <NotApprovedCtaButtons punishmentData={punishmentData} setIsDialogOpen={onOpenChange} />
          ),
        })}
      </PageAnalyticsProvider>
    </PageNavigationProvider>
  );
};

export default NotApprovedPageContent;
