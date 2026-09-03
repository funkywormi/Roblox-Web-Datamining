import { StateCreator } from 'zustand';
import { match as ReactRouterMatch } from 'react-router-dom';
import { HydrateParams, ContentSlice, UiSlice, SharedSlice, State } from './sliceTypes';
import reduceNextRoute from './reduceNextRoute';
import { SetState } from '../../shared/stores/storeTypes';

const createSharedSlice: StateCreator<UiSlice & ContentSlice, [], [], SharedSlice> = (
  set: SetState<State>,
  get
) => ({
  hydrate: ({ groupId, userId, useInlineReply }: HydrateParams) => {
    set({ groupId, userId, useInlineReply }, undefined, '@/hydrate');

    // eslint-disable-next-line no-void
    void get().loadCategories();
  },
  onRouteChange: async (nextRoute: ReactRouterMatch) => {
    const nextPartialState = await reduceNextRoute(get(), nextRoute);
    set(nextPartialState, undefined, '@/onRouteChange');
  }
});

export default createSharedSlice;
