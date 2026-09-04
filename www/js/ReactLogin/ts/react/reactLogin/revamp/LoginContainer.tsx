import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient, TranslationProvider } from 'react-utilities';
import { loginTranslationConfig } from '../translation.config';
import './main.css';
import LoginPage from './LoginPage';

const LoginContainer = (): JSX.Element => {
  return (
    <TranslationProvider config={loginTranslationConfig}>
      <QueryClientProvider client={queryClient}>
        <LoginPage />
      </QueryClientProvider>
    </TranslationProvider>
  );
};

export default LoginContainer;
