import { TranslateFunction } from "@rbx/core-scripts/react";
import Intl from "@rbx/core-scripts/intl";
import { getHelpDeskUrl } from "@rbx/core-scripts/util/url";
import { Loading } from "@rbx/core-ui";
import { FeatureGameDetails } from "../constants/translationConstants";
import useGameDetailsForUniverseId from "../../gameDetails/hooks/useGameDetailsForUniverseId";

enum TSponsoredUserCohort {
  Unspecified = "Unspecified",
  UnderEighteen = "UnderEighteen",
  EighteenPlusPersonalized = "EighteenPlusPersonalized",
  EighteenPlusNonPersonalized = "EighteenPlusNonPersonalized",
}

const intl = new Intl();
const getAdsPreferencesUrl = (locale: string): string => {
  return getHelpDeskUrl(locale, "28943243301780");
};

const getSponsoredDisclosureTranslationKey = (sponsoredUserCohort?: string): string => {
  switch (sponsoredUserCohort) {
    case TSponsoredUserCohort.UnderEighteen:
      return FeatureGameDetails.MessageSponsoredDisclosureU18;
    case TSponsoredUserCohort.EighteenPlusPersonalized:
      return FeatureGameDetails.MessageSponsoredDisclosureO18Personalized;
    case TSponsoredUserCohort.EighteenPlusNonPersonalized:
      return FeatureGameDetails.MessageSponsoredDisclosureO18NonPersonalized;
    default:
      return FeatureGameDetails.MessageSponsoredDisclosureU18;
  }
};

type TSponsoredDisclosureContentProps = {
  universeId: number;
  payerName?: string;
  sponsoredUserCohort?: string;
  translate: TranslateFunction;
};

const SponsoredDisclosureContent = ({
  universeId,
  payerName,
  sponsoredUserCohort,
  translate,
}: TSponsoredDisclosureContentProps): JSX.Element => {
  const { gameDetails, hasError, isFetching } = useGameDetailsForUniverseId(universeId.toString());
  if (isFetching) {
    return <Loading />;
  }

  const hasValidSponsoredInfo = gameDetails?.creator?.name && payerName && !hasError;
  const sponsoredDisclosureKey = getSponsoredDisclosureTranslationKey(sponsoredUserCohort);
  const sponsoredDisclosureText = hasValidSponsoredInfo
    ? translate(sponsoredDisclosureKey, {
        PayerName: payerName,
        CreatorName: gameDetails?.creator?.name,
      })
    : translate(FeatureGameDetails.MessageSponsoredDisclosureError);
  const shouldDisplayAdPreferencesLink =
    hasValidSponsoredInfo &&
    (sponsoredUserCohort === TSponsoredUserCohort.EighteenPlusPersonalized ||
      sponsoredUserCohort === TSponsoredUserCohort.EighteenPlusNonPersonalized);

  return (
    <div className="flex flex-col gap-small text-body-medium">
      {sponsoredDisclosureText}
      {shouldDisplayAdPreferencesLink && (
        <a
          href={getAdsPreferencesUrl(intl.getRobloxLocale())}
          className="text-link"
          target="_blank"
          rel="noreferrer"
        >
          {translate(FeatureGameDetails.MessageAdPreferences)}
        </a>
      )}
    </div>
  );
};

export default SponsoredDisclosureContent;
