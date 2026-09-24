import { ReportType } from "../illegalContentReport/helpers";
import { IPInfringementSubCategoryKey } from "../illegalContentReport/constants";

/**
 * Given a report type, return a filtering function. This function returns whether the illegal type should be displayed
 * on the report form.
 */
export const getIllegalTypeFilter = (
  reportType?: ReportType,
): ((illegalType: string) => boolean) => {
  switch (reportType) {
    case ReportType.OSA:
      return illegalType => illegalType !== IPInfringementSubCategoryKey;
    default:
      return () => true;
  }
};
