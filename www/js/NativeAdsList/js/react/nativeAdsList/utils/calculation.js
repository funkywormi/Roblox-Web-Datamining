import { abbreviateNumber } from 'core-utilities';

const formattedNumber = num => {
  const NUM_REGEX = /^\d+[,.]?\d*/g;

  if (!num) {
    return 0;
  }

  const abbreThreshold = 999999999;
  const abbreNum = abbreviateNumber.getAbbreviatedValue(num, null, abbreThreshold, true);
  let result = abbreNum;
  if (num > abbreThreshold) {
    result = abbreNum.replace(NUM_REGEX, '$& ');
  }
  return result;
};

const costPerAction = (adSpend, action) => {
  if (action === 0) {
    return 0;
  }
  const actionCost = (adSpend / action).toFixed(2);
  return formattedNumber(actionCost);
};

export { costPerAction, formattedNumber };
