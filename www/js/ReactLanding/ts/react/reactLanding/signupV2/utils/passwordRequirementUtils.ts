import { passwordValidatorErrorMessages } from '../../../common/constants/validationConstants';
import {
  isPasswordBadLength,
  isPasswordSameAsUsername
} from '../../../common/utils/passwordValidationUtils';

export enum PasswordRequirementId {
  Length = 'length',
  UsernameMatch = 'usernameMatch',
  Simple = 'simple'
}

export type PasswordRequirement = {
  id: PasswordRequirementId;
  isMet: boolean;
};

// The same three requirements the mobile signup tracks, ordered as the design lists them.
export const passwordRequirementIds = [
  PasswordRequirementId.Simple,
  PasswordRequirementId.Length,
  PasswordRequirementId.UsernameMatch
];

export const passwordRequirementLabels: Record<PasswordRequirementId, string> = {
  [PasswordRequirementId.Length]: 'Label.PasswordError1',
  [PasswordRequirementId.UsernameMatch]: 'Label.PasswordError2',
  [PasswordRequirementId.Simple]: 'Label.PasswordError3'
};

const isComplexityFailure = (validationMessage?: string): boolean =>
  validationMessage === passwordValidatorErrorMessages.PasswordComplexity ||
  validationMessage === passwordValidatorErrorMessages.PasswordKISAComplexity;

/**
 * Works out which requirements the password satisfies. Validation reports a single
 * failure per pass, so the message alone cannot describe all three rows: it has to be
 * read alongside the rules the caller can settle locally.
 */
export const getPasswordRequirements = (
  password: string,
  username: string,
  validationMessage?: string
): PasswordRequirement[] => {
  const meetsLength = !isPasswordBadLength(password);
  const meetsUsername = !isPasswordSameAsUsername(password, username);
  // Validation stops at the first failure and only reaches the complexity check, the one
  // rule that needs the server, once both local rules pass. Short of that the password is
  // simply unproven, so the row stays unmet rather than claiming a check that never ran.
  const wasComplexityChecked = meetsLength && meetsUsername;

  const isMetById: Record<PasswordRequirementId, boolean> = {
    [PasswordRequirementId.Length]: meetsLength,
    [PasswordRequirementId.UsernameMatch]: meetsUsername,
    [PasswordRequirementId.Simple]: wasComplexityChecked && !isComplexityFailure(validationMessage)
  };

  return passwordRequirementIds.map(id => ({
    id,
    isMet: Boolean(password) && isMetById[id]
  }));
};
