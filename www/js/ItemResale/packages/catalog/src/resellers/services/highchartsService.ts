import resellersConstants from "../constants/resellersConstants";
import { TDataPoint } from "../constants/types";

const { itemDelimiter, lineDelimiter } = resellersConstants.highCharts;

// The endpoint answers newest-first; the reverse is what makes the plotted series ascending.
const toRows = (dataPoints: TDataPoint[]): string =>
  [...dataPoints]
    .reverse()
    .map(dataPoint => `${new Date(dataPoint.date).getTime()}${itemDelimiter}${dataPoint.value}`)
    .join(lineDelimiter);

export const getDateMinusDays = (days: number): number => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.getTime();
};

export const toHighChartsData = (
  dataPoints: TDataPoint[],
): { csv: string; itemDelimiter: string; lineDelimiter: string } => ({
  csv: `col${itemDelimiter}row${lineDelimiter}${toRows(dataPoints)}${lineDelimiter}`,
  itemDelimiter,
  lineDelimiter,
});

export const highchartsService = { getDateMinusDays, toHighChartsData };

export default highchartsService;
