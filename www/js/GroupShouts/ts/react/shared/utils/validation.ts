import { getPlaintextLength } from '@rbx/richtext-editor';
import { Document } from '@rbx/richtext';
import { parseDocument } from './messageContentUtils';

const validateStringLength = (
  value: string | undefined,
  errorKey: string,
  min = 0,
  max = Infinity,
  trimWhiteSpace = true,
  ignoreEmpty = true
): string | undefined => {
  if (value === undefined) return undefined;
  let newValue = value; // Technically not needed since javascript strings are immutable, but TS complains if we don't do this
  if (trimWhiteSpace) newValue = value.trim();
  if (ignoreEmpty && (newValue == null || newValue.length === 0)) return undefined;
  if (newValue.length >= min && newValue.length <= max) return undefined;
  return errorKey;
};

const validateRichTextLength = (
  slate: Document | undefined,
  minErrorKey?: string,
  maxErrorKey?: string,
  min = 0,
  max = Infinity,
  ignoreEmpty = true
): string | undefined => {
  if (slate === undefined) {
    return undefined;
  }

  const safeContent = parseDocument({ slate });
  if (safeContent === undefined) {
    return undefined;
  }
  const length = getPlaintextLength(safeContent);

  if (ignoreEmpty && length === 0) return undefined;

  if (minErrorKey && length < min) return minErrorKey;
  if (maxErrorKey && length > max) return maxErrorKey;

  return undefined;
};

export default {
  validateStringLength,
  validateRichTextLength
};
