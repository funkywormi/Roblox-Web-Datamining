import React from 'react';
import { TranslateFunction, useTranslation } from 'react-utilities';
import { AuditLogDescriptionResult, AuditLogToken } from '../types';

const PLACEHOLDER_PATTERN = /\{([a-zA-Z0-9]+)\}/;

const renderToken = (
  token: AuditLogToken,
  key: string,
  translate: TranslateFunction
): React.ReactNode => {
  switch (token.kind) {
    case 'link':
      return (
        <a key={key} className='text-link' href={token.url}>
          {token.name}
        </a>
      );
    case 'currency': {
      if (!token.isRobux) {
        const tickets = `${token.amount} tickets`;
        return <React.Fragment key={key}>{tickets}</React.Fragment>;
      }
      return (
        <React.Fragment key={key}>
          <span className='icon-robux-16x16' />
          {token.amount}
        </React.Fragment>
      );
    }
    case 'translationList':
      return (
        <React.Fragment key={key}>
          {token.keys.map(translationKey => translate(translationKey)).join(', ')}
        </React.Fragment>
      );
    case 'translation':
      return <React.Fragment key={key}>{translate(token.key, token.params)}</React.Fragment>;
    default:
      return <React.Fragment key={key}>{token.value}</React.Fragment>;
  }
};

export interface AuditLogDescriptionProps {
  result?: AuditLogDescriptionResult | null;
}

const AuditLogDescription: React.FC<AuditLogDescriptionProps> = ({ result }) => {
  const { translate } = useTranslation();

  if (!result) {
    return null;
  }

  const params: Record<string, string> = {};
  Object.keys(result.tokens).forEach(key => {
    params[key] = `{${key}}`;
  });

  let message: string;
  try {
    message = translate(result.messageKey, params);
  } catch {
    return null;
  }

  return (
    <React.Fragment>
      {message.split(PLACEHOLDER_PATTERN).map((segment, index) => {
        if (index % 2 === 0) {
          return segment;
        }
        const token = result.tokens[segment];
        return token ? renderToken(token, segment, translate) : null;
      })}
    </React.Fragment>
  );
};

export default AuditLogDescription;
