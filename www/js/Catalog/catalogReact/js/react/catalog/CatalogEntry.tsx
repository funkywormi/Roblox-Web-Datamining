import React from 'react';
import { ready } from 'core-utilities';
import { render } from 'react-dom';
import '../../../css/tailwind.css';
import '../../../css/catalog/catalog.scss';
import { BrowserRouter } from 'react-router-dom';
import CatalogPageContainer from './containers/CatalogPageContainer';

const ENTRY_ID = 'catalog-react-container';

function renderCatalogContainer(): void {
  const containerElement = document.getElementById(ENTRY_ID);
  if (containerElement) {
    render(
      <BrowserRouter>
        <CatalogPageContainer />
      </BrowserRouter>,
      containerElement
    );
  }
}

ready(renderCatalogContainer);
