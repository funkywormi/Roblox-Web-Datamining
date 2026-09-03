import React, { useState, useEffect } from 'react';
import { RobloxIntlInstance } from '@rbx/legacy-webapp-types/Roblox';
import { TranslateFunction } from '@rbx/core-scripts/react';
import { urlService } from '@rbx/core-scripts/legacy/core-utilities';
import { translateHtml } from '@rbx/translation-utils';
import type { TranslateHtmlTag } from '@rbx/translation-utils';
import {
  ROBLOX_TERMS_OF_USE_URL,
  ROBLOX_TERMS_OF_USE_ANCHOR_FOR_DMCCA,
  LANG_KEYS
} from '../../../js/core/services/itemPurchaseUpsellService/constants/upsellConstants';
import ampFeatureService from '../services/ampFeatureService';

export default function useTermsOfUseText(
  translate: TranslateFunction,
  intl: RobloxIntlInstance
): React.ReactNode {
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
    urlService.getUrlWithLocale(ROBLOX_TERMS_OF_USE_URL, intl.getRobloxLocale()) +
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
