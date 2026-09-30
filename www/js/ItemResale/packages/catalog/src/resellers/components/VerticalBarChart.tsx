import React, { useCallback, useRef } from "react";
import HighchartsContainer from "./HighchartsContainer";
import { verticalBarChartConfig } from "../utils/chartConfigs";
import { TDataPoint } from "../constants/types";

type TVerticalBarChartProps = {
  chartDataPoints: TDataPoint[];
  days: number;
};

const VerticalBarChart = ({ chartDataPoints, days }: TVerticalBarChartProps): JSX.Element => {
  const idRef = useRef(`vertical_bar_chart_${new Date().getTime()}`);
  const daysRef = useRef(days);

  const buildConfig = useCallback(
    () => verticalBarChartConfig(chartDataPoints, daysRef.current),
    [chartDataPoints],
  );

  return <HighchartsContainer id={idRef.current} days={days} buildConfig={buildConfig} />;
};

export default VerticalBarChart;
