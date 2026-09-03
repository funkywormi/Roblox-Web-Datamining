import { EnvironmentUrls } from "@rbx/legacy-webapp-types/Roblox";
import { getUrlsList, isTooManyUrls } from '../util/urls';
import { OSAComplaintType } from './types';
import { BrazilECARoleOtherKey } from './constants';

/** Number of contents reported per submission  */
export const MAX_NUMBER_OF_CONTENTS = 5;

export const tooManyUrls = (rawUrl: string): boolean => {
  return isTooManyUrls(rawUrl, MAX_NUMBER_OF_CONTENTS);
};

// The type of the report, e.g. whether it's for DSA, OSA, or CHCR
export enum ReportType {
  DSA,
  OSA,
  CHCR,
  OSA_COMPLAINT,
  AU_OSA,
  AU_OSA_NON_COMPLIANCE,
  BR_ECA,
  US_NCII
}

export const reportTypeToString = (reportType?: ReportType): string => {
  switch (reportType) {
    case ReportType.DSA:
      return 'DSA';
    case ReportType.OSA:
      return 'OSA';
    case ReportType.CHCR:
      return 'CHCR';
    case ReportType.OSA_COMPLAINT:
      return 'OSASpecificComplaints';
    case ReportType.AU_OSA:
      return 'AuOSA';
    case ReportType.AU_OSA_NON_COMPLIANCE:
      return 'AuOSANonCompliance';
    case ReportType.BR_ECA:
      return 'BrECA';
    case ReportType.US_NCII:
      return 'UnitedStatesNCII';
    default:
      return '';
  }
};

/**
 * Splits up URLs and check if valid.
 * Currently, must match
 * - `https?://(www.)?{EnvironmentUrls.domain}/
 * - `https?://create.{EnvironmentUrls.domain}/`
 * Sounds like we want to change this in the near future.
 */
export const isValidRobloxUrl = (rawUrl: string): boolean => {
  const urls = getUrlsList(rawUrl);
  const allValid = urls.every(url => {
    try {
      const parsedUrl = new URL(url);
      const parsedDomain = parsedUrl.hostname.replace('www.', '');

      // Not sure if we need this still, but basically checks to see if we have
      // multiple protocols in the URL. e.g.
      // https://foobar.com;https://roblox.com
      // which I guess would enforce that the user uses commas to separate URLs
      const protocolMatches = parsedUrl.toString().match(/https?:\/\//g);
      if (protocolMatches && protocolMatches.length > 1) {
        return false;
      }

      return (
        parsedDomain === EnvironmentUrls.domain ||
        parsedDomain === `create.${EnvironmentUrls.domain}` ||
        parsedDomain === `devforum.${EnvironmentUrls.domain}`
      );
    } catch (error) {
      return false;
    }
  });
  return allValid && urls.length > 0;
};

/**
 * Checks if URL is valid and ready for form submission (standard form).
 * Returns false if URL is empty (when required), invalid format, or has too many URLs.
 * When isRequired is false (e.g. AU OSA), an empty URL is allowed; provided URLs are still validated.
 * Used for enabling/disabling submit button.
 */
export const isUrlValidForSubmission = (urlStr: string, isRequired = true): boolean => {
  const trimmed = urlStr.trim();
  if (!trimmed) {
    return !isRequired;
  }
  return isValidRobloxUrl(trimmed) && !tooManyUrls(trimmed);
};

/**
 * Checks if URL is valid and ready for form submission (OSA complaints form).
 * For ILLEGAL_CONTENT_TAKEDOWN: Returns false if URL is empty, invalid format, or has too many URLs.
 * For other complaint types: Always returns true (URL not required).
 * Used for enabling/disabling submit button.
 */
export const isUrlValidForOSASubmission = (urlStr: string, complaintType: string): boolean => {
  // If URL is not required for this complaint type, it's always valid
  if (complaintType !== OSAComplaintType.ILLEGAL_CONTENT_TAKEDOWN) return true;

  // For ILLEGAL_CONTENT_TAKEDOWN, use the standard URL validation
  return isUrlValidForSubmission(urlStr.trim());
};

/**
 * Checks if role selection is valid for Brazil ECA form.
 * Returns false if role is empty or "Other" (which redirects to support).
 * Used for enabling/disabling submit button.
 */
export const isRoleValidForBrazilECA = (role: string): boolean => {
  return !!role && role !== BrazilECARoleOtherKey;
};
