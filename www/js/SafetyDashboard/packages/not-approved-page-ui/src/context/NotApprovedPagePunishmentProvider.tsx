import { createContext, useContext, useMemo, ReactNode } from "react";
import { useNotApprovedTranslate } from "../providers/NotApprovedUIProvider";
import { TPunishment, CommutationEligibility } from "../utils/types";
import usePunishmentData from "../services/usePunishmentData";
import isPlatformEvidenceVisibleInView from "../utils/isPlatformEvidenceVisibleInView";
import useNotApprovedPageIxp, { IxpConfig } from "../services/useNotApprovedPageIxp";
import useCommutationEligibility from "../services/useCommutationEligibility";

interface NotApprovedPagePunishmentContextValue {
  // Whether the punishement data is still loading.
  isLoading: boolean;
  // The error if the punishment data fails to load.
  error: unknown;
  // The punishment data for the user.
  punishmentData?: TPunishment;
  /**
   * The reasons for the punishment (e.g. Profanity, Spam, etc.)
   * The translated reasons are used across muliple components to let the user know why they were punished.
   * The untranslated reasons are here for the future when we eventually want to have a way to properly show
   * users the Community Standards for a specific reason (policy).
   */
  violationReasons?: {
    translatedReasons: string[];
    untranslatedReasons: string[];
  };
  // Indefinitely cached IXP data for the user so that it can be used anywhere without multiple fetches.
  ixpData?: IxpConfig;
  // Commutation eligibility data for the user to determine if they are eligible for a Second Chance pass.
  commutationEligibility?: CommutationEligibility;
}

const NotApprovedPagePunishmentContext = createContext<
  NotApprovedPagePunishmentContextValue | undefined
>(undefined);

/**
 * A context provider that is used primary to provide the punishment data for the user on the Not Approved Page.
 * The context also handles storing the reasons for the punishment since the logic is reused across multiple components.
 */
export const NotApprovedPagePunishmentProvider = ({
  enableIxp = false,
  children,
}: {
  enableIxp?: boolean;
  children: ReactNode;
}) => {
  const translate = useNotApprovedTranslate();

  const { data: rawPunishmentData, isLoading, error } = usePunishmentData();
  const {
    data: ixpData,
    isLoading: isLoadingIxp,
    isFetching: isFetchingIxp,
  } = useNotApprovedPageIxp({ enabled: enableIxp });
  const { data: commutationEligibility, isLoading: isLoadingCommutation } =
    useCommutationEligibility();

  /**
   * The user-moderation API can return a 200 with a "cleared" / partially-shaped
   * payload (notably one without a `punishedUserId`) for users who are no longer
   * moderated but whose response is still being served from the service's
   * caches immediately after a successful reactivation. Treat that shape as
   * "no punishment" so descendants render null instead of trying to render a
   * partially-shaped dialog. We normalize here (rather than in
   * `usePunishmentData`) so the service hook stays a thin wrapper around the
   * raw query result.
   */
  const punishmentData = rawPunishmentData?.punishedUserId ? rawPunishmentData : undefined;

  const violationReasons = useMemo(() => {
    const translatedReasons = new Set<string>();
    const untranslatedReasons = new Set<string>();

    if (punishmentData?.violation && isPlatformEvidenceVisibleInView(punishmentData)) {
      punishmentData.violation.abuseTypeTranslationKeys.forEach(key => {
        translatedReasons.add(translate(key));
        untranslatedReasons.add(key);
      });
    } else {
      punishmentData?.badUtterances?.forEach(utterance => {
        translatedReasons.add(translate(utterance.labelTranslationKey));
        untranslatedReasons.add(utterance.labelTranslationKey);
      });
    }

    return {
      translatedReasons: [...translatedReasons].filter(Boolean),
      untranslatedReasons: [...untranslatedReasons].filter(Boolean),
    };
  }, [punishmentData, translate]);

  /**
   * The IXP query is disabled when the host does not provide an `ixp` integration. Under
   * react-query v4, a disabled query reports `isLoading: true` indefinitely, so relying
   * on `isLoadingIxp` alone would pin the whole page in a loading state forever for IXP-less hosts.
   */
  const isFetchingInitialIxp = isLoadingIxp && isFetchingIxp;
  const aggregatedIsLoading =
    isLoading || (enableIxp && isFetchingInitialIxp) || isLoadingCommutation;

  const contextValue = useMemo(
    () => ({
      isLoading: aggregatedIsLoading,
      error,
      punishmentData,
      violationReasons,
      ixpData,
      commutationEligibility,
    }),
    [aggregatedIsLoading, error, punishmentData, violationReasons, ixpData, commutationEligibility],
  );

  return (
    <NotApprovedPagePunishmentContext.Provider value={contextValue}>
      {children}
    </NotApprovedPagePunishmentContext.Provider>
  );
};

export const useNotApprovedPagePunishment = () => {
  const context = useContext(NotApprovedPagePunishmentContext);
  if (!context) {
    throw new Error(
      "useNotApprovedPagePunishment must be used within a NotApprovedPagePunishmentProvider",
    );
  }
  return context;
};
