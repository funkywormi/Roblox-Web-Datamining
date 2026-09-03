import React, { useState } from 'react';
import clsx from 'clsx';
import { TranslateFunction } from '@rbx/core-scripts/react';
import { formatNumber } from '@rbx/core-scripts/format/number';
import {
  Accordion,
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  Icon
} from '@rbx/foundation-ui';
import { translateHtml } from '@rbx/translation-utils';
import type { TranslateHtmlTag } from '@rbx/translation-utils';
import type { NormalizedDiscountInformation, NormalizedDiscountLine } from './discountInformation';
import isPlusBenefitDiscount from '../utils/isPlusBenefitDiscount';
import EmbeddableText from './EmbeddableText';

export type DiscountPriceDetailProps = {
  translate: TranslateFunction;
  normalizedDiscount: NormalizedDiscountInformation;
  savingsSummary?: string;
};

const RobuxAmount: React.FC<{ amount: number }> = ({ amount }) => {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const minusSign = '-';
  return (
    <React.Fragment>
      {isNegative && <span className='text-robux'>{minusSign}</span>}
      <span className='icon-robux-16x16' />
      <span className='text-robux'>{formatNumber(absAmount)}</span>
    </React.Fragment>
  );
};

const DiscountPriceDetail: React.FC<DiscountPriceDetailProps> = ({
  translate,
  normalizedDiscount,
  savingsSummary
}) => {
  const { savedAmount, originalPrice, totalPrice, discountLines } = normalizedDiscount;

  const [isOpen, setIsOpen] = useState(false);

  const hasPlusBenefitDiscount = isPlusBenefitDiscount(discountLines);
  const trimmedSavingsSummary = savingsSummary?.trim();

  const renderSavingsAmount = () => <RobuxAmount amount={savedAmount} />;
  const savingsTags: TranslateHtmlTag[] = [
    { opening: 'amountStart', closing: 'amountEnd', render: renderSavingsAmount }
  ];

  const renderSavingsHeader = () => {
    if (trimmedSavingsSummary) {
      return <EmbeddableText text={trimmedSavingsSummary} />;
    }
    if (hasPlusBenefitDiscount) {
      return translateHtml(translate, 'Description.SavingWithPlus', savingsTags, {
        robuxAmount: formatNumber(savedAmount)
      });
    }
    return translate('Description.SavingRobux', {
      robuxAmount: formatNumber(savedAmount)
    });
  };

  const renderDiscountLabel = (discount: NormalizedDiscountLine) => {
    if (!isPlusBenefitDiscount([discount])) {
      return <EmbeddableText text={discount.label} />;
    }
    // Prefer cart-pricing's localized attribution for the Plus line when provided;
    // otherwise fall back to the translated Plus benefit copy.
    if (discount.localizedAttribution) {
      return <EmbeddableText text={discount.localizedAttribution} />;
    }
    return translate('Label.PlusBenefitDiscount', {
      discountPercent: String(discount.discountPercent ?? 0)
    });
  };

  return (
    <Accordion className='text-body-medium padding-none stroke-default stroke-thick radius-medium'>
      <AccordionItem isOpen={isOpen} onOpenChange={setIsOpen}>
        <AccordionItemTrigger
          className={clsx(
            '!padding-medium bg-shift-100 width-full flex flex-row items-center justify-between',
            isOpen && '[border-bottom-left-radius:0] [border-bottom-right-radius:0]'
          )}>
          <div className='flex flex-row items-center gap-x-small content-emphasis'>
            {hasPlusBenefitDiscount && !trimmedSavingsSummary && (
              <Icon name='icon-regular-roblox-plus' size='Medium' />
            )}
            <span>{renderSavingsHeader()}</span>
          </div>
        </AccordionItemTrigger>
        <AccordionItemContent className='!padding-none'>
          <div
            className='padding-medium padding-bottom-small flex flex-col gap-y-small bg-shift-100 stroke-default stroke-thick'
            style={{ borderTop: '0px', borderLeft: '0px', borderRight: '0px' }}>
            <div className='flex flex-row items-center justify-between content-default'>
              <span>{translate('Label.Subtotal')}</span>
              <span className='flex flex-row items-center'>
                <RobuxAmount amount={originalPrice} />
              </span>
            </div>
            {discountLines.map((discount, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={`${discount.discountCampaign ?? 'discount'}-${index}`}
                className='flex flex-row items-center justify-between content-default'>
                <span>{renderDiscountLabel(discount)}</span>
                <span className='flex flex-row items-center'>
                  <RobuxAmount amount={-discount.discountAmount} />
                </span>
              </div>
            ))}
          </div>
          <div className='padding-medium flex flex-row items-center justify-between text-heading-small content-default bg-shift-100'>
            <span>{translate('Label.Total')}</span>
            <span className='flex flex-row items-center'>
              <RobuxAmount amount={totalPrice} />
            </span>
          </div>
        </AccordionItemContent>
      </AccordionItem>
    </Accordion>
  );
};

export default DiscountPriceDetail;
