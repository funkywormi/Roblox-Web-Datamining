import { QueryClientProvider } from '@tanstack/react-query';
import { ready } from '@rbx/core-scripts/legacy/core-utilities';
import { renderWithErrorBoundary, TranslationProvider, queryClient } from '@rbx/core-scripts/react';
import App from './src/App';
import { translations } from './component.json';
import './src/main.css';

ready(() => {
  const rootElement =
    document.getElementById('safety-support-page-web-app') ??
    document.getElementById('moderation-portal-container');

  if (rootElement) {
    renderWithErrorBoundary(
      <QueryClientProvider client={queryClient}>
        <TranslationProvider config={translations}>
          <App />
        </TranslationProvider>
      </QueryClientProvider>,
      rootElement
    );
  }
});
