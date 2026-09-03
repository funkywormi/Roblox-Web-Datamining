import React from 'react';

interface SubmitRequestBody {
  IllegalType?: string;
  OtherViolation?: string; // if IllegalType == 'other', OtherViolation is content of violated EU law; otherwise, OtherViolation is undefined.
  IllegalContentUrl?: string;
  Reason?: string;
  Country?: string;
  Name?: string;
  Email?: string;
  CaseId?: string;
  IsAppeal?: boolean;
  ReportType?: string;
  OptOutCommunication?: boolean;
  Custom?: Record<string, string>; // For OSA complaints and Brazil ECA custom fields
  OtpSessionToken?: string; // OTP session token from email verification
  VerificationToken?: string; // JWT proving email verified within 6 months (skips OTP when valid)
}

interface SubmitModal {
  title: string;
  content: string | React.ReactNode;
  buttonText: string;
}

interface MetadataResponse {
  countryList: string[];
  illegalTypeList: string[];
  chcrIllegalTypeList: string[];
  osaSpecificComplaintsIllegalTypeList: string[];
  auOSAIllegalTypeList: string[];
  auOSANonComplianceIllegalTypeList: string[];
  brECAIllegalTypeList: string[];
  name: string;
}

interface SendReportResponse {
  success: boolean;
  message: string;
  verificationToken?: string; // Set when backend returns new JWT (after OTP redeem or refresh)
}

// OSA Complaint Types
enum OSAComplaintType {
  ILLEGAL_CONTENT_TAKEDOWN = 'IllegalContentTakedown',
  TERMS_OF_SERVICE = 'TermsOfService',
  CHCR_SUBCATEGORY = 'CHCRSubcategory',
  CONTENT_REPORTING = 'ContentReporting',
  FREEDOM_OF_EXPRESSION_AND_PRIVACY = 'FreedomOfExpressionAndPrivacy',
  PROACTIVE_TECHNOLOGY = 'ProactiveTechnology'
}

// Base interface for all OSA complaint forms
interface BaseOSAComplaintData {
  name: string;
  email: string;
}

// Individual complaint form interfaces
interface TakedownDutiesComplaintData extends BaseOSAComplaintData {
  contentLink: string;
  initialReportDateAndMethod: string;
  resurfaceDescription: string;
}

interface TermsOfServiceComplaintData extends BaseOSAComplaintData {
  typeOfConcern: 'Content' | 'Clarity' | 'Application';
  quotedToSProvisions: string;
  explanationOfIssue: string;
}

interface OtherSafetyDutiesComplaintData extends BaseOSAComplaintData {
  safetyDutyBreached: string;
  factualDescription: string;
  breachExplanation: string;
}

interface ContentReportingDutiesComplaintData extends BaseOSAComplaintData {
  systemProcessElement: string;
  osaDutyBreachExplanation: string;
}

interface FreedomExpressionPrivacyComplaintData extends BaseOSAComplaintData {
  concernType: 'FreedomOfExpression' | 'Privacy' | 'Both';
  impactedPolicyOrFeature: string;
  lackOfRegardExplanation: string;
}

interface ProactiveTechnologyComplaintData extends BaseOSAComplaintData {
  restrictedContentDescription: string;
  proactiveTechnologyDescription: string;
  tosProvisions: string;
  tosBreachExplanation: string;
}

// Union type for all OSA complaint data
type OSAComplaintData =
  | TakedownDutiesComplaintData
  | TermsOfServiceComplaintData
  | OtherSafetyDutiesComplaintData
  | ContentReportingDutiesComplaintData
  | FreedomExpressionPrivacyComplaintData
  | ProactiveTechnologyComplaintData;

export type {
  SubmitRequestBody,
  SubmitModal,
  MetadataResponse,
  SendReportResponse,
  BaseOSAComplaintData,
  TakedownDutiesComplaintData,
  TermsOfServiceComplaintData,
  OtherSafetyDutiesComplaintData,
  ContentReportingDutiesComplaintData,
  FreedomExpressionPrivacyComplaintData,
  ProactiveTechnologyComplaintData,
  OSAComplaintData
};
export { OSAComplaintType };
