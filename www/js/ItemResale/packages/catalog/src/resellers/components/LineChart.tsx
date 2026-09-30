import React, { useCallback, useRef } from "react";
import HighchartsContainer from "./HighchartsContainer";
import { lineChartConfig } from "../utils/chartConfigs";
import { TDataPoint } from "../constants/types";

type TLineChartProps = {
  chartDataPoints: TDataPoint[];
  days: number;
};

const LineChart = ({ chartDataPoints, days }: TLineChartProps): JSX.Element => {
  const idRef = useRef(`line_chart_${new Date().getTime()}`);
  const daysRef = useRef(days);

  const buildConfig = useCallback(
    () => lineChartConfig(chartDataPoints, daysRef.current),
    [chartDataPoints],
  );

  return <HighchartsContainer id={idRef.current} days={days} buildConfig={buildConfig} />;
};

export default LineChart;
