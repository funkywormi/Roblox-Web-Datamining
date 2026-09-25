import { createContext, useContext, useMemo, ReactNode } from "react";
import { useNotApprovedUIConfig } from "../providers/NotApprovedUIProvider";
import { TPunishment, CommutationEligibility } from "../utils/types";
import usePunishmentData from "../services/usePunishmentData";
import isPlatformEvidenceVisibleInView from "../utils/isPlatformEvidenceVisibleInView";
import useNotApprovedPageIxp, { IxpConfig } from "../services/useNotApprovedPageIxp";
import useCommutationEligibility from "../services/useCommutationEligibility";
import collectKidsTranslations from "../utils/collectKidsTranslations";
import KIDS_CONTENT_BY_ABUSE_KEY from "../pageItemConfigs/educationalConfigs/kidsContentRegistry";
import { AgeExperience } from "../providers/types";

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
  // Whether this user is assigned to the Kids Not Approved Page treatment.
  isKidsTreatment: boolean;
  // The moderator note selected for the current treatment.
  moderatorNote: string;
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
  const { translate, ageExperience = AgeExperience.Default } = useNotApprovedUIConfig();
  const { data: rawPunishmentData, isLoading, error } = usePunishmentData();

  const {
    data: ixpData,
    isLoading: isLoadingIxp,
    isFetching: isFetchingIxp,
  } = useNotApprovedPageIxp({ enabled: enableIxp });

  const { data: commutationEligibility, isLoading: isLoadingCommutation } =
    useCommutationEligibility();

  const isKidsTreatment =
    ageExperience === AgeExperience.Kids &&
    enableIxp &&
    ixpData?.FFlagKidsNotApprovedPageTreatment2 === true;

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
    const untranslatedReasons = new Set<string>();

    if (punishmentData?.violation && isPlatformEvidenceVisibleInView(punishmentData)) {
      punishmentData.violation.abuseTypeTranslationKeys.forEach(key => {
        untranslatedReasons.add(key);
      });
    } else {
      punishmentData?.badUtterances?.forEach(utterance => {
        untranslatedReasons.add(utterance.labelTranslationKey);
      });
    }

    const abuseTypeKeys = [...untranslatedReasons].filter(Boolean);
    const translatedReasons = isKidsTreatment
      ? collectKidsTranslations(abuseTypeKeys, translate)
      : abuseTypeKeys.map(key => translate(key)).filter(Boolean);

    return {
      translatedReasons,
      untranslatedReasons: abuseTypeKeys,
    };
  }, [isKidsTreatment, punishmentData, translate]);

  /**
   * The moderator note is the message that is displayed to the user to explain why they were punished.
   * If the user is in the Kids treatment, we use the Kids content to get the moderator note.
   * Otherwise, we use the standard moderator note.
   *
   * TODO: If we continue with age-differentiated content, this should be sourced from the backend instead
   * of hardcoded on the frontend.
   */
  const moderatorNote = useMemo(() => {
    const standardModeratorNote =
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- blank moderator notes must use the generic fallback
      punishmentData?.messageToUser ||
      translate("Description.Violation", { startLink: "", endLink: "" });

    if (!isKidsTreatment || !punishmentData?.labelTranslationKey) {
      return standardModeratorNote;
    }

    const kidsContent = KIDS_CONTENT_BY_ABUSE_KEY[punishmentData.labelTranslationKey];
    if (!kidsContent) {
      return standardModeratorNote;
    }

    return translate(kidsContent.moderatorNote) || standardModeratorNote;
  }, [isKidsTreatment, punishmentData, translate]);

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
      isKidsTreatment,
      moderatorNote,
      commutationEligibility,
    }),
    [
      aggregatedIsLoading,
      error,
      punishmentData,
      violationReasons,
      ixpData,
      isKidsTreatment,
      moderatorNote,
      commutationEligibility,
    ],
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
