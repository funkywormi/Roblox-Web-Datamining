import React, { useEffect, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsData from "highcharts/modules/data";
import { getDateMinusDays } from "../services/highchartsService";

// Without the data module registered, the CSV-fed config renders both charts empty.
(HighchartsData as unknown as (h: unknown) => void)(Highcharts);

type THighchartsContainerProps = {
  id: string;
  className?: string;
  days: number;
  buildConfig: () => Record<string, unknown>;
};

// Building must not depend on `days`: a range change updates the axis in place, never remounts.
const HighchartsContainer = ({
  id,
  className,
  days,
  buildConfig,
}: THighchartsContainerProps): JSX.Element => {
  const elementRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Highcharts.ChartObject | null>(null);
  const buildConfigRef = useRef(buildConfig);
  buildConfigRef.current = buildConfig;

  useEffect(() => {
    if (!elementRef.current) {
      return undefined;
    }
    const config = buildConfigRef.current();
    chartRef.current = new Highcharts.Chart({
      ...config,
      chart: { ...(config.chart as object), renderTo: elementRef.current },
    } as Highcharts.Options);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.xAxis[0]?.update({ min: getDateMinusDays(days) });
  }, [days]);

  return <div id={id} className={className} ref={elementRef} />;
};

export default HighchartsContainer;
