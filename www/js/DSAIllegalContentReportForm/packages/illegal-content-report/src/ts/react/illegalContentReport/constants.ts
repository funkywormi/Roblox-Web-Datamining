const Limit = {
  MAX_URL_LENGTH: 2083,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 320,
  MAX_DESCRIPTION_LENGTH: 1000
};

const Urls = {
  SUPPORT_WEB_SUBSITE_BASE_PATH: '/illegal-content-reporting',
  SUPPORT_WEB_SUBSITE_COUNTRY_LIST_PATH: '/illegal-content-reporting/metadata',
  IP_INFRINGEMENT_AGENT_EMAIL: 'mailto:copyright_agent@roblox.com',
  IP_INFRINGEMENT_AGENT_EMAIL_SUBJECT: 'IP Infringement Report[DSA]',
  IP_INFRINGEMENT_ROBLOX_USER_TERMS_OF_USE:
    'https://en.help.roblox.com/hc/en-us/articles/115004647846#intellectual-property-and-ugc',
  PRIVACY_AND_COOKIE_POLICY:
    'https://en.help.roblox.com/hc/en-us/articles/115004630823-Roblox-Privacy-and-Cookie-Policy',
  ROBLOX_TERMS_OF_SERVICE:
    'https://en.help.roblox.com/hc/en-us/articles/115004647846-Roblox-Terms-of-Use'
};

const IllegalContentSubCategoryKey = 'IllegalContent';
const UKCHCROtherSubCategoryKey = 'UKCHCROther';
const ChildSexualExploitationSubCategoryKey = 'ChildSexualExploitation';
const IPInfringementSubCategoryKey = 'IPInfringement';
const AUOSANonComplianceOtherKey = 'AuOSANonComplianceOther';
const NCIIContentSubCategoryKey = 'NCIIContent';

// Character limits for the US NCII (Take It Down Act) removal request form.
// Description/Circumstances enforce the PRD 1000-char max; signature is a typed legal name.
const USNCIILimits = {
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_CIRCUMSTANCES_LENGTH: 1000,
  MAX_SIGNATURE_LENGTH: 200
};

const IllegalTypeTranslationMap = {
  [IllegalContentSubCategoryKey]: 'OTHER',
  [ChildSexualExploitationSubCategoryKey]: 'CHILD_SEXUAL_EXPLOITATION',
  TerrorismAndViolentExtremism: 'TERRORISM_AND_VIOLENT_EXTREMISM',
  [IPInfringementSubCategoryKey]: 'IP_INFRINGEMENT',
  ThreatsOfViolence: 'THREATS_OF_VIOLENCE',
  HateSpeech: 'HATE_SPEECH',
  Scams: 'SCAMS',
  IllegalGoodsAndActivities: 'ILLEGAL_GOODS_AND_ACTIVITIES',
  Suicide: 'SUICIDE',
  SelfHarm: 'SELF_HARM',
  EatingDisorder: 'EATING_DISORDER',
  Pornography: 'PORNOGRAPHY',
  AbuseAndHate: 'ABUSE_AND_HATE',
  Bullying: 'BULLYING',
  Violence: 'VIOLENCE',
  HarmfulSubstances: 'HARMFUL_SUBSTANCES',
  DangerousStuntsAndChallenges: 'DANGEROUS_STUNTS_AND_CHALLENGES',
  Depression: 'DEPRESSION',
  BodyStigma: 'BODY_STIGMA',
  [UKCHCROtherSubCategoryKey]: 'OTHER',
  // AU OSA specific types
  ChildExploitation: 'CHILD_EXPLOITATION',
  AuOSATerrorismAndViolentExtremism: 'AU_OSA_TERRORISM_AND_VIOLENT_EXTREMISM',
  ViolentContentAndGore: 'VIOLENT_CONTENT_AND_GORE',
  IllegalAndRegulatedGoodsAndActivities: 'ILLEGAL_AND_REGULATED_GOODS_AND_ACTIVITIES',
  AuOSANonConsensualIntimateImages: 'AU_OSA_NON_CONSENSUAL_INTIMATE_IMAGES',
  AuOSASexualExtortion: 'AU_OSA_SEXUAL_EXTORTION',
  AuOSAAdultPornographicMaterial: 'AU_OSA_ADULT_PORNOGRAPHIC_MATERIAL',
  AuOSASelfHarmMaterial: 'AU_OSA_SELF_HARM_MATERIAL',
  AuOSASimulatedGamblingMaterial: 'AU_OSA_SIMULATED_GAMBLING_MATERIAL',
  AuOSAOtherAgeRestrictedMaterial: 'AU_OSA_OTHER_AGE_RESTRICTED_MATERIAL',
  // AU OSA Non-Compliance specific types
  AccessibilityOfReportingTools: 'ReportingToolsAccessibility',
  TimelinessOfResponse: 'TimelinessOfResponse',
  InServiceSafetyInformationOrGuidance: 'InServiceInformation',
  [AUOSANonComplianceOtherKey]: 'Other',
  // Brazil ECA specific types
  BrECAChildSexualExploitation: 'BR_ECA_CHILD_SEXUAL_EXPLOITATION',
  BrECAPhysicalViolence: 'BR_ECA_PHYSICAL_VIOLENCE',
  BrECAOnlineHarassment: 'BR_ECA_ONLINE_HARASSMENT',
  BrECAPhysicalMentalHarm: 'BR_ECA_PHYSICAL_MENTAL_HARM',
  BrECAGambling: 'BR_ECA_GAMBLING',
  BrECAIllegalProducts: 'BR_ECA_ILLEGAL_PRODUCTS',
  BrECAMisleadingAds: 'BR_ECA_MISLEADING_ADS',
  BrECAPornographicContent: 'BR_ECA_PORNOGRAPHIC_CONTENT',
  BrECAOther: 'BR_ECA_OTHER'
};

const NonEuUserInfo = {
  MessageForNonEuUser:
    'This form is not accessible in your region. If you would like to file a report please visit:',
  DefaultSupportFormLink: 'https://www.roblox.com/support'
};

// Brazil ECA Role options
const BrazilECARoleOptions = {
  Victim: 'Victim',
  Representative: 'Representative',
  PublicProsecutor: 'PublicProsecutor',
  ChildRightsOrg: 'ChildRightsOrg',
  Other: 'Other'
};

const BrazilECARoleOtherKey = 'Other';
const BrazilECAChildSexualExploitationKey = 'BrECAChildSexualExploitation';

export {
  Limit,
  Urls,
  IllegalTypeTranslationMap,
  IllegalContentSubCategoryKey,
  UKCHCROtherSubCategoryKey,
  ChildSexualExploitationSubCategoryKey,
  IPInfringementSubCategoryKey,
  AUOSANonComplianceOtherKey,
  NCIIContentSubCategoryKey,
  USNCIILimits,
  NonEuUserInfo,
  BrazilECARoleOptions,
  BrazilECARoleOtherKey,
  BrazilECAChildSexualExploitationKey
};
