import React, { useMemo } from 'react';
import { TranslateFunction } from 'react-utilities';
import { InfoOutlinedIcon } from '@rbx/ui';
import { Tooltip } from 'react-style-guide';
import PriceTag from '../../../../priceTag/components/PriceTag';

const PERCENTAGE_MULTIPLIER = 100;
const PERCENTAGE_DECIMAL_PLACES = 2;
const TAX_PLACEHOLDER = '—';

export interface Tax {
  amount: number;
  currencyCode: string;
}

export interface TaxDisplayProps {
  translate: TranslateFunction;
  tax?: Tax;
  taxRate?: number; // Tax rate as a decimal (e.g., 0.1 for 10%)
  taxDisplay?: boolean;
  visible?: boolean;
  isLoading?: boolean;
}

export const TaxDisplay = ({
  translate,
  tax,
  taxRate,
  taxDisplay,
  visible = true,
  isLoading = false
}: TaxDisplayProps): JSX.Element | null => {
  const baseTaxLabel = useMemo(() => translate('Label.Tax') || 'Tax', [translate]);

  const taxRateDisplayString = useMemo(() => {
    if (isLoading || taxRate === undefined || taxRate === null || !taxDisplay) {
      return null;
    }
    return (taxRate * PERCENTAGE_MULTIPLIER).toFixed(PERCENTAGE_DECIMAL_PLACES);
  }, [taxRate, isLoading, taxDisplay]);

  const tooltipContent = useMemo(
    () => translate('Description.TaxInfoTooltip') || 'Tax is determined by billing information',
    [translate]
  );

  const renderTaxAmount = () => {
    if (!taxDisplay) {
      return <span className='text-placeholder'>{TAX_PLACEHOLDER}</span>;
    }

    if (isLoading) {
      return (
        <div className='calculating-tax'>
          <span className='loading-spinner' />
          <span>{translate('Label.CalculatingTax') || 'Calculating tax...'}</span>
        </div>
      );
    }

    if (!tax) {
      return <span className='text-placeholder'>{TAX_PLACEHOLDER}</span>;
    }

    return <PriceTag amount={(tax.amount || 0) * -1} currencyCode={tax.currencyCode} />;
  };

  if (!visible) {
    return null;
  }

  return (
    <div className='tax-line d-flex justify-content-between row-pad'>
      <span className='bold'>
        {baseTaxLabel}
        {taxRateDisplayString && ` (${taxRateDisplayString}%)`}
        <Tooltip id='tax-info-tooltip' placement='right' content={tooltipContent}>
          <InfoOutlinedIcon className='tax-info-icon' />
        </Tooltip>
      </span>
      {renderTaxAmount()}
    </div>
  );
};
