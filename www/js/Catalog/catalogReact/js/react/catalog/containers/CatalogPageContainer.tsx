import React from 'react';
import CatalogPage from '../components/catalogPage/CatalogPage';
import ErrorBoundary from './ErrorBoundry';

function CatalogPageContainer(): JSX.Element {
  return (
    <ErrorBoundary containerName='CatalogPageContainer'>
      <CatalogPage />
    </ErrorBoundary>
  );
}

export default CatalogPageContainer;
