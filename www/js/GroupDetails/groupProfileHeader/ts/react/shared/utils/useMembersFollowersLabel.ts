import { useTranslation } from 'react-utilities';

const translationKeys = {
  members: {
    singular: {
      capitalized: 'Label.Member',
      lowercase: 'Label.MemberLowerCase'
    },
    plural: {
      capitalized: 'Label.MemberCapitalPlural',
      lowercase: 'Label.MemberLowerCasePlural'
    }
  },
  followers: {
    singular: {
      capitalized: 'Label.FollowerCapital',
      lowercase: 'Label.Follower'
    },
    plural: {
      capitalized: 'Label.FollowerCapitalPlural',
      lowercase: 'Label.FollowerPlural'
    }
  }
} as const;

const useMembersFollowersLabel = ({
  hasSocialModules,
  count,
  truncatedCount,
  capitalize
}: {
  hasSocialModules: boolean;
  count: number;
  truncatedCount: string;
  capitalize: boolean;
}): string => {
  const { translate } = useTranslation();
  const nounType = count === 1 ? 'singular' : 'plural';
  const casing = capitalize ? 'capitalized' : 'lowercase';
  const nounKey = hasSocialModules
    ? translationKeys.members[nounType][casing]
    : translationKeys.followers[nounType][casing];

  const noun = translate(nounKey);

  const resolvedCount = truncatedCount || count.toLocaleString();
  return `${resolvedCount} ${noun}`;
};

export default useMembersFollowersLabel;
