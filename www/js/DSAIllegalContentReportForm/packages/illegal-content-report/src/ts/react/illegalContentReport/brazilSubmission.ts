import { ReportType, reportTypeToString } from "./helpers";
import type { SubmitRequestBody } from "./types";

const BRAZIL_COUNTRY_NAME = "Brazil";

export enum BrazilWomenIntimateStanding {
  AFFECTED_USER = "affected-user",
  AUTHORIZED_REP = "authorized-rep",
}

export enum BrazilWomenSafetyStanding {
  AFFECTED_PERSON = "affected-person",
  ON_BEHALF = "on-behalf",
}

export enum BrazilAdsAdType {
  MISLEADING = "misleading",
  ABUSIVE = "abusive",
  FRAUDULENT = "fraudulent",
}

export enum BrazilAdsReporterType {
  INDIVIDUAL_USER = "individual-user",
  NATIONAL_CONSUMER_DEFENSE_SYSTEM = "national-consumer-defense-system",
  FEDERAL_ATTORNEY_GENERALS_OFFICE = "federal-attorney-generals-office",
  OTHER_AUTHORITY = "other-authority",
  OTHER = "other",
}

export const BrazilSubmissionIllegalType = {
  INTIMATE_CONTENT: "BrIntimateContent",
  WOMEN_SAFETY: "BrWomenSafety",
  ADS_MISLEADING: "BrAdMisleading",
  ADS_ABUSIVE: "BrAdAbusive",
  ADS_FRAUDULENT: "BrAdFraudulent",
} as const;

const BRAZIL_ADS_ILLEGAL_TYPE: Record<BrazilAdsAdType, string> = {
  [BrazilAdsAdType.MISLEADING]: BrazilSubmissionIllegalType.ADS_MISLEADING,
  [BrazilAdsAdType.ABUSIVE]: BrazilSubmissionIllegalType.ADS_ABUSIVE,
  [BrazilAdsAdType.FRAUDULENT]: BrazilSubmissionIllegalType.ADS_FRAUDULENT,
};

const BRAZIL_ADS_REPORTER_TYPE: Record<BrazilAdsReporterType, string> = {
  [BrazilAdsReporterType.INDIVIDUAL_USER]: "IndividualUser",
  [BrazilAdsReporterType.NATIONAL_CONSUMER_DEFENSE_SYSTEM]: "NationalConsumerDefenseSystem",
  [BrazilAdsReporterType.FEDERAL_ATTORNEY_GENERALS_OFFICE]: "FederalAttorneyGeneralsOffice",
  [BrazilAdsReporterType.OTHER_AUTHORITY]: "OtherCompetentAuthority",
  [BrazilAdsReporterType.OTHER]: "Other",
};

const BRAZIL_WOMEN_SAFETY_STANDING: Record<BrazilWomenSafetyStanding, string> = {
  [BrazilWomenSafetyStanding.AFFECTED_PERSON]: "AffectedPerson",
  [BrazilWomenSafetyStanding.ON_BEHALF]: "OnBehalf",
};

export const isBrazilAdsAuthorityReporter = (reporterType: BrazilAdsReporterType | ""): boolean => {
  return (
    reporterType === BrazilAdsReporterType.NATIONAL_CONSUMER_DEFENSE_SYSTEM ||
    reporterType === BrazilAdsReporterType.FEDERAL_ATTORNEY_GENERALS_OFFICE ||
    reporterType === BrazilAdsReporterType.OTHER_AUTHORITY
  );
};

interface CommonBrazilSubmissionInput {
  contentLocation: string;
  description: string;
  name: string;
  email: string;
}

interface BrazilWomenIntimateSubmissionInput extends CommonBrazilSubmissionInput {
  circumstances: string;
  signature: string;
  signatureTimestamp: string;
  standing: BrazilWomenIntimateStanding;
}

interface BrazilWomenSafetySubmissionInput extends CommonBrazilSubmissionInput {
  standing: BrazilWomenSafetyStanding;
}

interface BrazilAdsSubmissionInput extends CommonBrazilSubmissionInput {
  adType: BrazilAdsAdType;
  reporterType: BrazilAdsReporterType;
  authorityReferenceNumber: string;
}

export const buildBrazilWomenIntimateRequest = ({
  contentLocation,
  description,
  circumstances,
  signature,
  signatureTimestamp,
  standing,
  name,
  email,
}: BrazilWomenIntimateSubmissionInput): SubmitRequestBody => {
  const trimmedDescription = description.trim();
  const trimmedCircumstances = circumstances.trim();
  const reason = trimmedCircumstances
    ? `${trimmedDescription}\n\nCircumstances: ${trimmedCircumstances}`
    : trimmedDescription;

  return {
    ReportType: reportTypeToString(ReportType.BR_INTIMATE_CONTENT),
    IllegalType: BrazilSubmissionIllegalType.INTIMATE_CONTENT,
    IllegalContentUrl: contentLocation.trim(),
    Reason: reason,
    Country: BRAZIL_COUNTRY_NAME,
    Name: name.trim(),
    Email: email.trim(),
    IsAppeal: false,
    OptOutCommunication: false,
    Custom: {
      ElectronicSignature: signature.trim(),
      SignatureTimestamp: signatureTimestamp,
      IsAuthorizedRep: String(standing === BrazilWomenIntimateStanding.AUTHORIZED_REP),
    },
  };
};

export const buildBrazilWomenSafetyRequest = ({
  contentLocation,
  description,
  standing,
  name,
  email,
}: BrazilWomenSafetySubmissionInput): SubmitRequestBody => {
  return {
    ReportType: reportTypeToString(ReportType.BR_WOMEN_SAFETY),
    IllegalType: BrazilSubmissionIllegalType.WOMEN_SAFETY,
    IllegalContentUrl: contentLocation.trim(),
    Reason: description.trim(),
    Country: BRAZIL_COUNTRY_NAME,
    Name: name.trim(),
    Email: email.trim(),
    IsAppeal: false,
    OptOutCommunication: false,
    Custom: {
      ReporterStanding: BRAZIL_WOMEN_SAFETY_STANDING[standing],
    },
  };
};

export const buildBrazilAdsRequest = ({
  contentLocation,
  description,
  adType,
  reporterType,
  authorityReferenceNumber,
  name,
  email,
}: BrazilAdsSubmissionInput): SubmitRequestBody => {
  const custom: Record<string, string> = {
    ReporterType: BRAZIL_ADS_REPORTER_TYPE[reporterType],
  };
  const trimmedAuthorityReference = authorityReferenceNumber.trim();

  if (isBrazilAdsAuthorityReporter(reporterType) && trimmedAuthorityReference) {
    custom.AuthorityReferenceNumber = trimmedAuthorityReference;
  }

  return {
    ReportType: reportTypeToString(ReportType.BR_AD),
    IllegalType: BRAZIL_ADS_ILLEGAL_TYPE[adType],
    IllegalContentUrl: contentLocation.trim(),
    Reason: description.trim(),
    Country: BRAZIL_COUNTRY_NAME,
    Name: name.trim(),
    Email: email.trim(),
    IsAppeal: false,
    OptOutCommunication: false,
    Custom: custom,
  };
};
