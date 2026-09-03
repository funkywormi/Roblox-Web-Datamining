import { ReportType } from '../illegalContentReport/helpers';

/**
 * Given a report type, return a filtering function. This function returns whether the illegal type should be displayed
 * on the report form.
 */
export const getIllegalTypeFilter = (
  reportType?: ReportType
): ((illegalType: string) => boolean) => {
  switch (reportType) {
    case ReportType.OSA:
      return illegalType => illegalType !== 'IPInfringement';
    default:
      return () => true;
  }
};
