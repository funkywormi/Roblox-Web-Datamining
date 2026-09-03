import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { UiSlice, ContentSlice, SharedSlice } from '../store/sliceTypes';
import createUiSlice from '../store/createUiSlice';
import createContentSlice from '../store/createContentSlice';
import createSharedSlice from '../store/createSharedSlice';
import createSelectors from '../../shared/stores/createSelectors';

const useForumStore = createSelectors(
  create<UiSlice & ContentSlice & SharedSlice>()(
    devtools((...args) => ({
      ...createUiSlice(...args),
      ...createContentSlice(...args),
      ...createSharedSlice(...args)
    }))
  )
);

export default useForumStore;
