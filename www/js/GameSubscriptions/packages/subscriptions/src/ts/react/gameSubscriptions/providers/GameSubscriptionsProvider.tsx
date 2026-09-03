import React, { useReducer } from 'react';
import GameSubscriptionsContext, {
  initialState,
  gameSubscriptionsReducer
} from '../utils/GameSubscriptionsContext';

const GameSubscriptionsProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(gameSubscriptionsReducer, initialState);

  return (
    <GameSubscriptionsContext.Provider
      value={{
        state,
        dispatch
      }}>
      {children}
    </GameSubscriptionsContext.Provider>
  );
};

export default GameSubscriptionsProvider;
