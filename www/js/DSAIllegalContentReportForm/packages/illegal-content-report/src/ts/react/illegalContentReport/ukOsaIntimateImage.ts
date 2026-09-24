export enum UKOSAIntimateImageStanding {
  DEPICTED_PERSON = "depicted-person",
  AUTHORIZED_REPRESENTATIVE = "authorized-representative",
}

const SUBMISSION_STANDING: Record<UKOSAIntimateImageStanding, string> = {
  [UKOSAIntimateImageStanding.DEPICTED_PERSON]: "DepictedPerson",
  [UKOSAIntimateImageStanding.AUTHORIZED_REPRESENTATIVE]: "AuthorizedRepresentative",
};

interface UKOSAIntimateImageSubmissionInput {
  isDeclarationConfirmed: boolean;
  standing: UKOSAIntimateImageStanding;
  relationshipToDepictedPerson: string;
}

export const buildUKOSAIntimateImageCustom = ({
  isDeclarationConfirmed,
  standing,
  relationshipToDepictedPerson,
}: UKOSAIntimateImageSubmissionInput): Record<string, string> => {
  const custom: Record<string, string> = {
    BeliefIsIntimateImage: String(isDeclarationConfirmed),
    ReporterStanding: SUBMISSION_STANDING[standing],
  };

  if (standing === UKOSAIntimateImageStanding.AUTHORIZED_REPRESENTATIVE) {
    custom.RelationshipToDepictedPerson = relationshipToDepictedPerson.trim();
  }

  return custom;
};
