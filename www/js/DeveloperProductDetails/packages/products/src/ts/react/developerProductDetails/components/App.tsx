import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { getPageUrlLocale } from "@rbx/core-scripts/endpoints";
import { useTheme } from "@rbx/core-scripts/legacy/react-utilities";
import { queryClient } from "@rbx/core-scripts/react";
import { UIThemeProvider } from '@rbx/ui';
import DeveloperProductDetailsPage from './DeveloperProductDetailsPage';

const urlLocale = getPageUrlLocale();
const routerBasename = urlLocale ? `/${urlLocale}` : '';

const App: React.FC = () => {
  const theme = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <UIThemeProvider theme={theme} cssBaselineMode='disabled'>
        <BrowserRouter basename={routerBasename}>
          <Switch>
            <Route
              path='/developer-product/:universeId/product/:productId'
              component={DeveloperProductDetailsPage}
            />
          </Switch>
        </BrowserRouter>
      </UIThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
