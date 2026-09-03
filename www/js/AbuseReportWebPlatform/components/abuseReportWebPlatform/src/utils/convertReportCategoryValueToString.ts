/**
 * These are taken directly from abuse-reporting:
 * https://sourcegraph.rbx.com/github.rbx.com/Roblox/abuse-reporting/-/blob/internal/models/translation/constants.go?L16:2&popover=pinned
 * We should look into not providing a number through the BEDUI json, instead passing in an enum string for category so we can remove this mapping
 */
const reportCategoryValueToStringMap: Record<string, string | undefined> = {
  "1": "inappropriate language - profanity & adult content",
  "2": "asking for or giving private information",
  "3": "bullying, harassment, hate speech",
  "4": "dating",
  "5": "exploiting, cheating, scamming",
  "6": "account theft - phishing, hacking, trading",
  "7": "inappropriate content - place, image, model",
  "8": "real life threats & suicide threats",
  "9": "other rule violation",
  "12": "inaccurate age guidelines - blood, violence",
};

const convertReportCategoryValueToString = (reportCategoryValue: string) =>
  reportCategoryValueToStringMap[reportCategoryValue];

export default convertReportCategoryValueToString;
