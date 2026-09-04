import { usernameValidatorErrorMessages } from '../../../common/constants/validationConstants';
import {
  areUsernameCharactersValid,
  isUsernameLengthValid,
  isUsernameUnderscorePlacementValid
} from '../../../common/utils/usernameValidationUtils';
import { validationMessages } from '../../constants/signupConstants';

export enum UsernameRequirementId {
  Length = 'length',
  Characters = 'characters',
  Underscore = 'underscore',
  Available = 'available'
}

export enum UsernameAvailability {
  Unknown = 'unknown',
  Available = 'available',
  Unavailable = 'unavailable'
}

export type UsernameRequirement = {
  id: UsernameRequirementId;
  isMet?: boolean;
};

export const usernameRequirementIds = [
  UsernameRequirementId.Length,
  UsernameRequirementId.Characters,
  UsernameRequirementId.Underscore,
  UsernameRequirementId.Available
];

export const usernameRequirementLabels: Record<UsernameRequirementId, string> = {
  [UsernameRequirementId.Length]: 'Label.UsernameError2',
  [UsernameRequirementId.Characters]: 'Label.UsernameError1',
  [UsernameRequirementId.Underscore]: 'Label.UsernameError5',
  [UsernameRequirementId.Available]: 'Label.UsernameError3'
};

export const usernameRequirementErrorMessages = new Set<string>([
  usernameValidatorErrorMessages.UsernameInvalidLength,
  usernameValidatorErrorMessages.InvalidCharacters,
  usernameValidatorErrorMessages.UsernameInvalidUnderscore,
  validationMessages.usernameAlreadyInUse,
  validationMessages.usernameNotAvailable
]);

export const getUsernameRequirements = (
  username: string,
  availability: UsernameAvailability
): UsernameRequirement[] => {
  const hasUsername = username.length > 0;
  const isMetById: Record<UsernameRequirementId, boolean | undefined> = {
    [UsernameRequirementId.Length]: hasUsername ? isUsernameLengthValid(username) : undefined,
    [UsernameRequirementId.Characters]: hasUsername
      ? areUsernameCharactersValid(username)
      : undefined,
    [UsernameRequirementId.Underscore]: hasUsername
      ? isUsernameUnderscorePlacementValid(username)
      : undefined,
    [UsernameRequirementId.Available]:
      availability === UsernameAvailability.Unknown
        ? undefined
        : availability === UsernameAvailability.Available
  };

  return usernameRequirementIds.map(id => ({
    id,
    isMet: isMetById[id]
  }));
};
