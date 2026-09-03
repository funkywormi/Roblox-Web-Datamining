import './src/main.css';
import { renderWithErrorBoundary } from '@rbx/core-scripts/react';
import ready from '@rbx/core-scripts/util/ready';
import IllegalContentReportApp from '@rbx/illegal-content-report/ts/react/illegalContentReport/IllegalContentReportApp';
import NonEuUserApp from '@rbx/illegal-content-report/ts/react/illegalContentReport/NonEuUserApp';
import AUOSAApp from '@rbx/illegal-content-report/ts/react/illegalContentReport/AUOSAApp';
import BrazilECAApp from '@rbx/illegal-content-report/ts/react/illegalContentReport/BrazilECAApp';
import USNCIIApp from '@rbx/illegal-content-report/ts/react/illegalContentReport/USNCIIApp';

const osaContentReportEntryPoint = document.getElementById('osa-illegal-content-report-container');

const illegalContentReportEntryPoint = document.getElementById(
  'dsa-illegal-content-report-container'
);

const nonEuUserEntryPoint = document.getElementById(
  'non-eu-user-dsa-illegal-content-report-container'
);

const auOsaContentReportEntryPoint = document.getElementById(
  'au-osa-illegal-content-report-container'
);

const brazilEcaContentReportEntryPoint = document.getElementById(
  'brazil-eca-illegal-content-report-container'
);

const usNciiContentReportEntryPoint = document.getElementById(
  'united-states-ncii-illegal-content-report-container'
);

const renderApp = (): void => {
  if (osaContentReportEntryPoint) {
    renderWithErrorBoundary(<IllegalContentReportApp isUKUser />, osaContentReportEntryPoint);
  } else if (illegalContentReportEntryPoint) {
    renderWithErrorBoundary(<IllegalContentReportApp isUKUser={false} />, illegalContentReportEntryPoint);
  } else if (auOsaContentReportEntryPoint) {
    renderWithErrorBoundary(<AUOSAApp />, auOsaContentReportEntryPoint);
  } else if (brazilEcaContentReportEntryPoint) {
    renderWithErrorBoundary(<BrazilECAApp />, brazilEcaContentReportEntryPoint);
  } else if (usNciiContentReportEntryPoint) {
    renderWithErrorBoundary(<USNCIIApp />, usNciiContentReportEntryPoint);
  } else if (nonEuUserEntryPoint) {
    renderWithErrorBoundary(<NonEuUserApp />, nonEuUserEntryPoint);
  }
};

ready(() => {
  renderApp();
});
