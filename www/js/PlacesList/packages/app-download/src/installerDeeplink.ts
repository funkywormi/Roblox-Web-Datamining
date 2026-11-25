import { downloadSourceType } from "./deferredDeeplinkConstants";
import { getDownloadLinkParams } from "./getDownloadLinkParams";

// Same rules as the gameLaunch component's deferredDeeplinkUtilities, for hosts without it.

// Supported deep link paths can be found https://roblox.atlassian.net/wiki/x/2YC4Xg
const supportedPathPatterns = [
  "/games/{placeId}/{placeName}",
  "/share-links?code={linkId}&type=ExperienceInvite",
].map(path => new RegExp(path.replace(/\{.*?\}/g, "([^/]+)")));

const getExperienceAffiliateReferralUrl = (url: string): string | null => {
  try {
    const referral = new URL(url).searchParams.get("referralUrl");
    if (!referral) {
      return null;
    }
    const referralUrl = new URL(decodeURIComponent(referral));
    return referralUrl.pathname === "/share-links" &&
      referralUrl.searchParams.get("type") === "ExperienceAffiliate"
      ? referralUrl.href
      : null;
  } catch {
    return null;
  }
};

/** The page the installed client should open, or `null` when the page isn't deep-linkable. */
export const getInstallerDeeplinkUrl = (url: string): string | null => {
  const affiliateReferralUrl = getExperienceAffiliateReferralUrl(url);
  if (affiliateReferralUrl) {
    return affiliateReferralUrl;
  }
  const sanitizedUrl = new URL(url);
  sanitizedUrl.search = "";
  sanitizedUrl.hash = "";
  return supportedPathPatterns.some(pattern => pattern.test(sanitizedUrl.pathname))
    ? sanitizedUrl.toString()
    : null;
};

/** `?token=…` for the installer download URL, or `""` when there's nothing to deep-link. */
export const getInstallerDeeplinkQueryParams = async (url: string): Promise<string> => {
  const linkId = getInstallerDeeplinkUrl(url);
  if (!linkId) {
    return "";
  }
  const { token } = await getDownloadLinkParams({
    linkId,
    downloadSource: downloadSourceType.Installer,
  });
  return token ? `?token=${token}` : "";
};
