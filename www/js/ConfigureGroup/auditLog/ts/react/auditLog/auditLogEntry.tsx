import Roblox from 'Roblox';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { queryClient, TranslationProvider } from 'react-utilities';
import { QueryClientProvider } from '@tanstack/react-query';
import auditLogConfig from './translation.config';
import AuditLogContainer from './containers/AuditLogContainer';
import { AuditLogPolicies } from './types';

import '../../../css/tailwind.css';
import '../../../css/configureGroup.scss';

export interface AuditLogProps {
  groupId: number;
  policies?: AuditLogPolicies;
}

const renderAuditLog = (container: Element, props: AuditLogProps): void => {
  unmountComponentAtNode(container);
  render(
    <TranslationProvider config={auditLogConfig}>
      <QueryClientProvider client={queryClient}>
        <AuditLogContainer groupId={props.groupId} policies={props.policies} />
      </QueryClientProvider>
    </TranslationProvider>,
    container
  );
};

const AuditLogService = {
  renderAuditLog
};

Object.assign(Roblox, {
  AuditLogService
});

export default renderAuditLog;
