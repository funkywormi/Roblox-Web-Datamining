// Should be kept in sync with AdsManagementService.CampaignTargetType
enum CampaignTargetType {
  // CampaignTargetType.Undefined is a placeholder to prevent `0` from being
  // used, which is necessary in the backend implementation of this enum because
  // default(int) = 0 in C#. It is not necessary in TypeScript because
  // default(number) = undefined. This is the only enum value that does not need
  // to be synchronized between AdsManagementService.CampaignTargetType and here.
  // Undefined = 0,
  Universe = 1,
  Asset = 2
}

export default CampaignTargetType;
