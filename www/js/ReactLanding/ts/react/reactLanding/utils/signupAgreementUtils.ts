import { USER_AGREEMENTS } from '../constants/signupConstants';

export type SignupAgreement = {
  id: string;
  agreementType: string;
};

/**
 * Resolves the agreement IDs used by the production signup control. Regional
 * policy stays outside request serialization so other signup surfaces can pass
 * their already-resolved IDs directly to the request builder.
 */
export const getProductionSignupAgreementIds = (
  userAgreements: SignupAgreement[],
  isUserAgreementsEnabled: boolean,
  shouldExcludeOptionalPersonalInformationPolicy: boolean
): string[] | undefined => {
  if (!isUserAgreementsEnabled || userAgreements.length === 0) {
    return undefined;
  }

  return userAgreements
    .filter(
      agreement =>
        !shouldExcludeOptionalPersonalInformationPolicy ||
        agreement.agreementType !== USER_AGREEMENTS.OptionalPersonalInformationPolicy
    )
    .map(agreement => agreement.id);
};
