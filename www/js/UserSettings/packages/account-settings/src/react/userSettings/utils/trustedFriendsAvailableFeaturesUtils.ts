const CHAT_ACROSS_AGE_GROUPS_FEATURE = "chatAcrossAgeGroups";
const CHAT_WITHOUT_FILTER_FEATURE = "chatWithoutFilter";

const CHAT_ACROSS_AGE_GROUPS_FEATURES = [CHAT_ACROSS_AGE_GROUPS_FEATURE] as const;
const CHAT_ACROSS_AGE_GROUPS_AND_CHAT_WITHOUT_FILTER_FEATURES = [
  CHAT_ACROSS_AGE_GROUPS_FEATURE,
  CHAT_WITHOUT_FILTER_FEATURE,
] as const;

export enum AddTrustedConnectionFeatureSet {
  ChatAcrossAgeGroups = "ChatAcrossAgeGroups",
  ChatAcrossAgeGroupsAndChatWithoutFilter = "ChatAcrossAgeGroupsAndChatWithoutFilter",
  Default = "Default",
}

/** True when `features` matches `expected` exactly, order-independent. */
const matchesFeatureSet = (
  features: string[] | undefined,
  expected: readonly string[],
): boolean => {
  if (!features || features.length !== expected.length) {
    return false;
  }
  const sortedFeatures = features.toSorted();
  const sortedExpected = [...expected].toSorted();
  return sortedFeatures.every((value, i) => value === sortedExpected[i]);
};

export const getAddTrustedConnectionFeatureSet = (
  features?: string[],
): AddTrustedConnectionFeatureSet => {
  if (matchesFeatureSet(features, CHAT_ACROSS_AGE_GROUPS_FEATURES)) {
    return AddTrustedConnectionFeatureSet.ChatAcrossAgeGroups;
  }
  if (matchesFeatureSet(features, CHAT_ACROSS_AGE_GROUPS_AND_CHAT_WITHOUT_FILTER_FEATURES)) {
    return AddTrustedConnectionFeatureSet.ChatAcrossAgeGroupsAndChatWithoutFilter;
  }
  return AddTrustedConnectionFeatureSet.Default;
};
