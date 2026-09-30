import React, { useRef, useState } from "react";
import { numberFormat } from "core-utilities";
import { WithTranslationsProps, withTranslations } from "react-utilities";
import resellersConstants from "../constants/resellersConstants";
import { TResaleData } from "../constants/types";
import translationConfig from "../translation.config";
import LineChart from "./LineChart";
import VerticalBarChart from "./VerticalBarChart";
import PriceChartRangeDropdown from "./PriceChartRangeDropdown";

export type TAssetResaleDataPaneProps = {
  resaleData: TResaleData;
  isLimited2?: boolean;
};

// The two formatters differ only on zero. They must not be collapsed into one.
export const formatNumber = (
  value: number | null | undefined,
  notAvailable: string,
): string | number =>
  value !== null && value !== undefined && value > 0
    ? numberFormat.getNumberFormat(value)
    : notAvailable;

export const formatNumberIncludeZero = (
  value: number | null | undefined,
  notAvailable: string,
): string | number => {
  if (value === null || value === undefined) {
    return notAvailable;
  }
  if (value >= 0) {
    return numberFormat.getNumberFormat(value);
  }
  return notAvailable;
};

export const showResellerChart = (resaleData: TResaleData, isLimited2?: boolean): boolean => {
  if (!isLimited2) {
    return (resaleData.recentAveragePrice ?? 0) > 0;
  }
  return (
    (resaleData.priceDataPoints?.length ?? 0) > 0 ||
    (resaleData.volumeDataPoints?.length ?? 0) > 0 ||
    (resaleData.recentAveragePrice ?? -1) >= 0 ||
    (resaleData.originalPrice ?? -1) >= 0 ||
    (resaleData.sales ?? -1) >= 0
  );
};

export const AssetResaleDataPane = ({
  resaleData,
  isLimited2,
  translate,
}: TAssetResaleDataPaneProps & WithTranslationsProps): JSX.Element => {
  const notAvailable = translate(resellersConstants.translationKeys.notAvailable);
  const { resaleChartDayOptions } = resellersConstants;

  const [selectedResaleChartDays, setSelectedResaleChartDays] = useState(
    resaleChartDayOptions[resaleChartDayOptions.length - 1] as number,
  );

  // Computed once on mount and never recomputed.
  const availability = useRef({
    chartDataAvailable:
      (resaleData.priceDataPoints?.length ?? 0) > 0 &&
      (resaleData.volumeDataPoints?.length ?? 0) > 0,
    historicalDataAvailable: showResellerChart(resaleData, isLimited2),
  });
  const { chartDataAvailable, historicalDataAvailable } = availability.current;

  const format = isLimited2 ? formatNumberIncludeZero : formatNumber;
  const formatDays = (days: number) => translate("Label.XDays", { numberOfDays: days });

  if (!historicalDataAvailable) {
    return (
      <div id="no-price-chart-data" className="section-content-off">
        {translate("Label.NoHistoricalData")}
      </div>
    );
  }

  return (
    <div className="section-content price-volume-charts-container">
      {chartDataAvailable && (
        <React.Fragment>
          <PriceChartRangeDropdown
            dayOptions={resaleChartDayOptions}
            selectedDays={selectedResaleChartDays}
            onSelect={setSelectedResaleChartDays}
            formatDays={formatDays}
          />
          <div className="price-chart-legend">
            <div className="line" />
            <div className="text-pastname legend-text">{translate("Label.RecentAveragePrice")}</div>
            <div className="line volume" />
            <div className="text-pastname legend-text">{translate("Label.Volume")}</div>
          </div>
          <LineChart
            chartDataPoints={resaleData.priceDataPoints ?? []}
            days={selectedResaleChartDays}
          />
          <VerticalBarChart
            chartDataPoints={resaleData.volumeDataPoints ?? []}
            days={selectedResaleChartDays}
          />
        </React.Fragment>
      )}
      <div className="clearfix">
        <div className="price-chart-info-container clearfix">
          <div className="text-label">{translate("Label.QuantitySold")}</div>
          <div id="item-quantity-sold" className="text-lead info-content">
            {format(resaleData.sales, notAvailable)}
          </div>
        </div>
        <div className="price-chart-info-container clearfix">
          <div className="text-label">{translate("Label.OriginalPrice")}</div>
          <div id="item-original-price" className="info-content">
            <span id="original-price-robux-icon" className="icon-robux-20x20" />
            <span className="text-robux">{format(resaleData.originalPrice, notAvailable)}</span>
          </div>
        </div>
        <div className="price-chart-info-container clearfix">
          <div className="text-label">{translate("Label.AveragePrice")}</div>
          <div className="info-content">
            <span className="icon-robux-20x20" />
            <span id="item-average-price" className="text-robux">
              {format(resaleData.recentAveragePrice, notAvailable)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withTranslations(AssetResaleDataPane, translationConfig);
