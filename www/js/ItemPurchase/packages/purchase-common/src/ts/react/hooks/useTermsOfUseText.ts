import React, { useState, useEffect } from 'react';
import { getUrlWithLocale } from '@rbx/core-scripts/util/url';
import { getLocaleFromDocument } from '@rbx/www-common/intl';
import { localeToLowercaseUnderscore } from '@rbx/www-common/locale';
import { translateHtml } from '@rbx/translation-utils';
import type { TranslateHtmlTag } from '@rbx/translation-utils';
import { type PurchaseTranslate } from '../itemPurchase/useTranslate';
import {
  ROBLOX_TERMS_OF_USE_URL,
  ROBLOX_TERMS_OF_USE_ANCHOR_FOR_DMCCA,
  LANG_KEYS
} from '../../core/services/itemPurchaseUpsellService/constants/upsellConstants';
import ampFeatureService from '../services/ampFeatureService';

export default function useTermsOfUseText(translate: PurchaseTranslate): React.ReactNode {
  const [isDmccaLegalTextFeature, setIsDmccaLegalTextFeature] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ampFeatureService()
      .getDmccaLegalTextFeature()
      .then(isShowDmcca => {
        if (isShowDmcca) setIsDmccaLegalTextFeature(true);
      })
      .catch(err => {
        console.warn('Failed to fetch DMCCA feature', err);
      });
  }, []);

  const url =
    getUrlWithLocale(ROBLOX_TERMS_OF_USE_URL, localeToLowercaseUnderscore(getLocaleFromDocument())) +
    (isDmccaLegalTextFeature ? ROBLOX_TERMS_OF_USE_ANCHOR_FOR_DMCCA : '');

  const tags: TranslateHtmlTag[] = [
    {
      opening: 'aTagStart',
      closing: 'aTagEnd',
      render: text =>
        React.createElement(
          'a',
          { href: url, target: '_blank', rel: 'noreferrer', className: 'underline' },
          text
        )
    }
  ];

  return translateHtml(translate, LANG_KEYS.termsOfUseText, tags);
}
