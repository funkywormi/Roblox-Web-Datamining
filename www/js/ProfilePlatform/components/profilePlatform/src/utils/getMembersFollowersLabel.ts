type TranslateFunction = (key: string, params?: Record<string, unknown>) => string;

const translationKeys = {
  members: {
    singular: {
      capitalized: "Label.Member",
      lowercase: "Label.MemberLowerCase",
    },
    plural: {
      capitalized: "Label.MemberCapitalPlural",
      lowercase: "Label.MemberLowerCasePlural",
    },
  },
  followers: {
    singular: {
      capitalized: "Label.FollowerCapital",
      lowercase: "Label.Follower",
    },
    plural: {
      capitalized: "Label.FollowerCapitalPlural",
      lowercase: "Label.FollowerPlural",
    },
  },
} as const;

type GetMembersFollowersLabelParams = {
  hasSocialModules: boolean;
  count: number;
  truncatedCount: string;
  capitalize: boolean;
};

const getMembersFollowersLabel = (
  translate: TranslateFunction,
  { hasSocialModules, count, truncatedCount, capitalize }: GetMembersFollowersLabelParams,
): string => {
  const nounType = count === 1 ? "singular" : "plural";
  const casing = capitalize ? "capitalized" : "lowercase";
  const nounKey = hasSocialModules
    ? translationKeys.members[nounType][casing]
    : translationKeys.followers[nounType][casing];

  const noun = translate(nounKey);
  const resolvedCount = truncatedCount || count.toLocaleString();
  return `${resolvedCount} ${noun}`;
};

export default getMembersFollowersLabel;
