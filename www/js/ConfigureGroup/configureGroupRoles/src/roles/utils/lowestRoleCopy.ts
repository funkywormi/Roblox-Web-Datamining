import type { UseTranslationResult } from '@rbx/intl';
import TranslationNamespace from '../../constants/TranslationNamespace';

const EnglishCopy = {
  'Message.LowestRoleAutoGrantWarning':
    'This role is automatically granted upon joining this group. Permissions granted to this role apply to newly joining users. Review them carefully.',
  'Heading.ConfirmLowestRoleReorder': 'Change the lowest role?',
  'Message.ConfirmLowestRoleReorder':
    'The new lowest role will automatically be granted upon joining this group. Permissions granted to this role will apply to newly joining users. Are you sure you want to continue?',
} as const;

// Prefer translations as they are registered; show English until each key is available.
export const translateLowestRoleCopy = (
  translateWithNamespace: UseTranslationResult['translateWithNamespace'],
  key: keyof typeof EnglishCopy,
): string => translateWithNamespace(TranslationNamespace.GroupManagement, key) || EnglishCopy[key];
