import { escapeHtml as escapeHtmlGenerator } from 'core-utilities';

export const parseEventParams = (params: Record<string, any>): Record<string, string | number> => {
  return Object.keys(params).reduce<Record<string, string | number>>((acc, key) => {
    if (typeof params[key] === 'object' && params[key]) {
      acc[key] = JSON.stringify(params[key]);
    }

    if (typeof params[key] === 'number') {
      acc[key] = params[key] as number;
    }

    if (typeof params[key] === 'string') {
      acc[key] = encodeURIComponent(params[key]);
    }

    if (typeof params[key] === 'boolean') {
      acc[key] = params[key] ? 1 : 0;
    }

    return acc;
  }, {});
};

export const escapeHtml = escapeHtmlGenerator();

export default parseEventParams;
