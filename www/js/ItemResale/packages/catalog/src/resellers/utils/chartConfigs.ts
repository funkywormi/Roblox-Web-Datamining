import { abbreviateNumber } from "core-utilities";
import resellersConstants from "../constants/resellersConstants";
import { TDataPoint } from "../constants/types";
import { getDateMinusDays, toHighChartsData } from "../services/highchartsService";

const { highCharts } = resellersConstants;

// Module-load, not render-time: the plotted upper bound is fixed for the life of the bundle.
const defaultChartMax = new Date().getTime();

// Fresh nested objects per call: the two charts mutate chart.* and xAxis.*, so a shared spread leaks.
const defaultConfiguration = (max: number) => ({
  chart: {
    backgroundColor: highCharts.colors.backgroundColor,
    marginLeft: highCharts.marginLeft,
  },
  title: { text: "" },
  legend: { enabled: false },
  tooltip: {
    backgroundColor: highCharts.colors.borderColor,
    borderColor: highCharts.colors.borderColor,
    pointFormat: `<span style="color:${highCharts.colors.pointColor}">{point.y}</span>`,
    headerFormat: "",
  },
  xAxis: {
    type: "datetime",
    max,
    tickLength: 0,
  },
  credits: { enabled: false },
});

export const lineChartConfig = (
  dataPoints: TDataPoint[],
  days: number,
  max: number = defaultChartMax,
): Record<string, unknown> => {
  const chartData = defaultConfiguration(max) as Record<string, any>;
  chartData.colors = [highCharts.colors.lineColor];
  chartData.chart.height = highCharts.lineChartHeight;
  chartData.data = toHighChartsData(dataPoints);
  chartData.xAxis.min = getDateMinusDays(days);
  chartData.xAxis.labels = { format: "{value:%m/%d}" };
  chartData.yAxis = {
    title: { text: "" },
    labels: {
      formatter(this: { value: number }) {
        return abbreviateNumber.getAbbreviatedValue(this.value, undefined, 1000);
      },
    },
  };
  return chartData;
};

export const verticalBarChartConfig = (
  dataPoints: TDataPoint[],
  days: number,
  max: number = defaultChartMax,
): Record<string, unknown> => {
  const chartData = defaultConfiguration(max) as Record<string, any>;
  chartData.chart.type = "column";
  chartData.colors = [highCharts.colors.verticalBarColor];
  chartData.chart.height = highCharts.verticalBarChartHeight;
  chartData.data = toHighChartsData(dataPoints);
  chartData.xAxis.min = getDateMinusDays(days);
  chartData.xAxis.labels = { enabled: false };
  chartData.yAxis = {
    gridLineWidth: 0,
    minorGridLineWidth: 0,
    title: { text: "" },
    labels: { enabled: false },
  };
  chartData.plotOptions = { series: { pointWidth: 1 } };
  return chartData;
};
