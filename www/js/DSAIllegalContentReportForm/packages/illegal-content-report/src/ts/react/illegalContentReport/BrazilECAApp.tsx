import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@rbx/core-scripts/react';
import { TranslationProvider } from '../util/translation';
import BrazilECAForm from './BrazilECAForm';
import { dsaTranslationConfig } from '../../../translation.config';
import '../style/shared.scss';
import './style.scss';

/**
 * Application component for Brazil users' illegal content reporting.
 * Provides a form for reporting violations of children's rights under Brazil's ECA
 * (Statute of the Child and Adolescent).
 */
const BrazilECAApp = (): React.ReactElement => {
  const queryParams = new URLSearchParams(window.location.search);
  const contentURLParam = queryParams.get('contentURL');

  return (
    <TranslationProvider translationConfig={dsaTranslationConfig}>
      <QueryClientProvider client={queryClient}>
        <div id='generic-challenge-container' />
        <BrazilECAForm defaultContentURL={contentURLParam} />
      </QueryClientProvider>
    </TranslationProvider>
  );
};

export default BrazilECAApp;

