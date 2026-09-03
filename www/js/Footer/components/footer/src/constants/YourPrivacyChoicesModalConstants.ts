// Translation keys
const titleErrorTranslationKey = "Title.Error";
const titleGpcDetectedTranslationKey = "Title.GpcDetected";
const titleNoGpcDetectedTranslationKey = "Title.NoGpcDetected";
const bodyErrorTranslationKey = "Body.Error";
const bodyGpcMissingSettingIneligible = "Body.GpcMissingSettingIneligible";
const bodyGpcMissingSettingEligible = "Body.GpcMissingSettingEligible";
const bodyGpcDetectedSettingEnabledIneligible = "Body.GpcDetectedSettingEnabledIneligible";
const bodyGpcDetectedSettingEnabledEligible = "Body.GpcDetectedSettingEnabledEligible";
const bodyGpcDetectedSettingDisabledIneligible = "Body.GpcDetectedSettingDisabledIneligible";
const bodyGpcDetectedSettingDisabledEligible = "Body.GpcDetectedSettingDisabledEligible";
const actionOk = "Action.Ok";
const actionClose = "Action.Close";
const descriptionLoading = "Description.Loading";

// Html constants
const learnMoreATagStart =
  '<a href="https://en.help.roblox.com/hc/articles/28943243301780" target="_blank" rel="noreferrer" class="text-link">';
const aTagWithHrefStart = "<a href=";
// TODO: try not interpolating a string into the script
const getHrefEnd = (adsPreferencesUrl: string): string => {
  return ` onclick="if(window.location.pathname.includes('/my/account')){event.preventDefault();window.location.href='${adsPreferencesUrl}';window.location.reload();}" class="text-link">`;
};
const aTagEnd = "</a>";
const lineBreak = "<br />";

export {
  titleErrorTranslationKey,
  titleGpcDetectedTranslationKey,
  titleNoGpcDetectedTranslationKey,
  bodyErrorTranslationKey,
  bodyGpcMissingSettingIneligible,
  bodyGpcMissingSettingEligible,
  bodyGpcDetectedSettingEnabledIneligible,
  bodyGpcDetectedSettingEnabledEligible,
  bodyGpcDetectedSettingDisabledIneligible,
  bodyGpcDetectedSettingDisabledEligible,
  actionOk,
  actionClose,
  descriptionLoading,
  learnMoreATagStart,
  aTagWithHrefStart,
  getHrefEnd,
  aTagEnd,
  lineBreak,
};
