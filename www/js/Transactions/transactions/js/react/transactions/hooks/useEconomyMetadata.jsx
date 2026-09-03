import React, { createContext, useContext, useEffect, useState } from 'react';
import { getEconomyMetadata } from '../services/transactionsDataService';

const EconomyMetadataContext = createContext(null);

export const EconomyMetadataProvider = ({ children }) => {
  const [metadata, setMetadata] = useState(null);
  const [status, setStatus] = useState('initializing');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'initializing') {
      setStatus('loading');
      getEconomyMetadata()
        .then(economyMetadata => {
          setMetadata(economyMetadata);
          setStatus('success');
        })
        .catch(err => {
          setError(err);
          setStatus('error');
        });
    }
  }, [status]);

  return (
    <EconomyMetadataContext.Provider value={{ metadata, setMetadata, status, error }}>
      {children}
    </EconomyMetadataContext.Provider>
  );
};

export const useEconomyMetadata = () => {
  const { metadata, setMetadata, status, error } = useContext(EconomyMetadataContext);
  return { metadata, setMetadata, status, error };
};
