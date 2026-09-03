import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from 'react-utilities';
import reducers from './reducers';

import '../../../css/friendRecommendations/friendRecommendations.scss';
import '../../../css/friends/friends.scss';

import App from './App';
import { FriendsMetadataContextProvider } from './context/friendsMetadataContext';

const store = createStore(reducers, applyMiddleware(thunk));

export default function FriendsApp(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <FriendsMetadataContextProvider>
          <App />
        </FriendsMetadataContextProvider>
      </Provider>
    </QueryClientProvider>
  );
}
