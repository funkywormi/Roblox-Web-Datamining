const allowedPathnames = ["/share-links"];
const allowedLinkTypes = ["ExperienceAffiliate"];

const getIsExperienceAffiliate = (url: URL): boolean => {
  return (
    allowedPathnames.includes(url.pathname) &&
    allowedLinkTypes.includes(url.searchParams.get("type") ?? "")
  );
};

const getLinkParam = (url: string, param: string): string => {
  try {
    const parsedUrl = new URL(url);
    if (allowedPathnames.includes(parsedUrl.pathname)) {
      return parsedUrl.searchParams.get(param) ?? "";
    }
    return "";
  } catch (e) {
    return "";
  }
};

const getExperienceAffiliateReferralUrl = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    const referral = parsedUrl.searchParams.get("referralUrl");

    if (!referral) {
      return null;
    }

    const referralUrl = new URL(decodeURIComponent(referral));
    if (getIsExperienceAffiliate(referralUrl)) {
      return referralUrl.href;
    }

    return null;
  } catch (e) {
    return null;
  }
};

const getExperienceAffiliateReferralUrlParams = (
  url: string,
): { linkCode: string; linkType: string } => {
  const affiliateUrl = getExperienceAffiliateReferralUrl(url);
  if (affiliateUrl) {
    return {
      linkCode: getLinkParam(affiliateUrl, "code"),
      linkType: getLinkParam(affiliateUrl, "type"),
    };
  }
  return { linkCode: "", linkType: "" };
};

export default getExperienceAffiliateReferralUrlParams;
