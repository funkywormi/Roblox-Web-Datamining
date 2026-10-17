import { TranslateFunction } from "react-utilities";
import { TRANSLATION_KEYS } from "../../constants/redeemConstants";

/**
 * Generates the HTML content for robux conversion messages
 * @param translate - Translation function
 * @param numberOfPurchase - Number indicating which purchase this is
 * @param robuxConversionAmount - Amount of robux being converted
 * @param remainingCreditBalance - Remaining credit balance
 * @param currencyCode - Currency code for the credit
 * @returns HTML string for the conversion message
 */
const generateRobuxConversionMessage = (
  translate: TranslateFunction,
  numberOfPurchase: number,
  robuxConversionAmount: number,
  remainingCreditBalance: number,
  currencyCode: string,
): string => {
  const robuxIcon = '<span class="icon-robux-16x16" style="transform: translateY(-2px)"></span>';

  return numberOfPurchase === 1
    ? translate(TRANSLATION_KEYS.ConvertCreditToRobuxMessageTwentyFivePercentMore, {
        robuxAmount: `${robuxIcon}${robuxConversionAmount}`,
        boldStart: "<b>",
        boldEnd: "</b>",
      })
    : `${translate(TRANSLATION_KEYS.ConvertToRobuxStep3Message, {
        remainingCreditBalance: `<span class='fiat-price-tag ml-1' data-amount=${remainingCreditBalance} data-currency-code=${currencyCode}></span>`,
        lineBreaker: "<br /><br />",
        robuxConversionAmount: `<span class="icon-robux-16x16" style="transform: translateY(-2px)"></span><b>${robuxConversionAmount}</b>`,
      })} ${translate(
        TRANSLATION_KEYS.ConvertCreditToRobuxMessageTwentyFivePercentMoreStandalone,
      )}`;
};

export default generateRobuxConversionMessage;
