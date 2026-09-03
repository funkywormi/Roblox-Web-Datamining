import { QueryClientConfig } from '@tanstack/react-query';

const defaultQueryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    }
  }
};

export default defaultQueryClientConfig;
