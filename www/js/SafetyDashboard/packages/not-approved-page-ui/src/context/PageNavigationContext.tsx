import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  ReactNode,
  ComponentType,
} from "react";
import type { CommutationEligibility } from "../utils/types";
import {
  NAPageItemConfigType,
  CtaComponentProps,
  PageConfigType,
  PageName,
  StaticPageName,
} from "../pageItemConfigs/ConfigTypes";

export interface PageNavigationContextValue {
  // Current state
  currentPage: number;
  currentPageName: PageName;
  totalPages: number;

  // Navigation functions
  goToNextPage: () => void;
  goToPreviousPage: () => void;

  // Utility values
  isFirstPage: boolean;
  isLastPage: boolean;

  // For progress calculation (returns 0-100)
  getProgress: () => number;

  // Whether its showing educational pages (used for various conditional rendering)
  hasEducationalPages: boolean;

  // Current page configs
  currentPageConfigs: NAPageItemConfigType[];
  CurrentCtaComponent: ComponentType<CtaComponentProps> | undefined;

  // Violation types that couldn't be mapped to educational content (for analytics)
  unmappedViolationKeys: string[];

  // Whether the user has navigated forward at least once (used to hide first-page-only UI)
  hasNavigatedForward: boolean;
}

const PageNavigationContext = createContext<PageNavigationContextValue | undefined>(undefined);

interface PageNavigationProviderProps {
  pages: PageConfigType[];
  unmappedViolationKeys: string[];
  hasEducationalPages: boolean;
  commutationEligibility?: CommutationEligibility;
  children: ReactNode;
}

/**
 * Context provider for managing page navigation state and logic.
 * This provider centralizes all page-related state and navigation logic.
 */
export const PageNavigationProvider = ({
  pages,
  unmappedViolationKeys,
  hasEducationalPages,
  commutationEligibility,
  children,
}: PageNavigationProviderProps) => {
  const [page, setPage] = useState(0);
  const [hasNavigatedForward, setHasNavigatedForward] = useState(false);

  const currentPageName: PageName = pages[page]?.pageName ?? StaticPageName.Unknown;
  const totalPages = pages.length;
  const isFirstPage = page === 0;
  const isLastPage = page === totalPages - 1;

  const isEducationalPassEligible = useMemo(
    () => commutationEligibility?.educational_pass_eligible ?? false,
    [commutationEligibility],
  );

  /**
   * --------------------------------------------------------------
   * Page navigation functions
   * --------------------------------------------------------------
   */

  const goToNextPage = useCallback(() => {
    if (page < totalPages - 1) {
      setHasNavigatedForward(true);
      setPage(prevPage => prevPage + 1);
    }
  }, [page, totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (page > 0) {
      setPage(prevPage => prevPage - 1);
    }
  }, [page]);

  /**
   * --------------------------------------------------------------
   * Progress calculation (0 to 100)
   * --------------------------------------------------------------
   */

  const getProgress = useCallback(() => {
    if (
      totalPages <= 1 ||
      currentPageName === StaticPageName.SecondChanceIntro ||
      currentPageName === StaticPageName.Intro
    ) {
      return 0;
    }

    // Subtract 1 page to account for the first page (0th index) not being part of the progress bar.
    let totalPagesForProgress = totalPages - 1;
    let currentPageIndex = page;

    // Subtract 1 page to account for the Second Chance intro page not being part of the progress bar.
    totalPagesForProgress -= isEducationalPassEligible ? 1 : 0;
    currentPageIndex -= isEducationalPassEligible ? 1 : 0;

    // Should never happen but protection against division by zero.
    if (totalPagesForProgress <= 0) return 0;

    const progress = (currentPageIndex / totalPagesForProgress) * 100;
    return Math.round(progress);
  }, [page, totalPages, currentPageName, isEducationalPassEligible]);

  const contextValue = useMemo<PageNavigationContextValue>(
    () => ({
      currentPage: page,
      currentPageName,
      totalPages,
      goToNextPage,
      goToPreviousPage,
      isFirstPage,
      isLastPage,
      getProgress,
      hasEducationalPages,
      currentPageConfigs: pages[page]?.pageItems ?? [],
      CurrentCtaComponent: pages[page]?.CtaComponent,
      unmappedViolationKeys,
      hasNavigatedForward,
    }),
    [
      page,
      currentPageName,
      totalPages,
      goToNextPage,
      goToPreviousPage,
      isFirstPage,
      isLastPage,
      getProgress,
      pages,
      hasEducationalPages,
      unmappedViolationKeys,
      hasNavigatedForward,
    ],
  );

  return (
    <PageNavigationContext.Provider value={contextValue}>{children}</PageNavigationContext.Provider>
  );
};

/**
 * Hook to access page navigation context.
 * Must be used within a PageNavigationProvider.
 */
export const usePageNavigation = (): PageNavigationContextValue => {
  const context = useContext(PageNavigationContext);
  if (!context) {
    throw new Error("usePageNavigation must be used within PageNavigationProvider");
  }
  return context;
};
