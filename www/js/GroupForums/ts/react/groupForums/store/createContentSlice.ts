import { StateCreator } from 'zustand';
import { ContentSlice } from './sliceTypes';
import { ForumCategory } from '../types';
import forumsService from '../services/forumsService';
import { SetState } from '../../shared/stores/storeTypes';

const createContentSlice: StateCreator<ContentSlice, [], [], ContentSlice> = (
  set: SetState<ContentSlice>,
  get
) => ({
  groupId: 0,
  userId: 0,
  categories: [],
  archivedCategories: [], // Added support for archived categories
  categoriesLoaded: false,
  pinnedPosts: [],
  categoryPosts: [],
  blockedUserList: [],
  blockUser: (userId: number) =>
    set(
      state => ({
        blockedUserList: [...state.blockedUserList, userId]
      }),
      undefined,
      'content/blockUser'
    ),
  clearBlockedUsers: () =>
    set(
      {
        blockedUserList: []
      },
      undefined,
      'content/clearBlockedUsers'
    ),
  loadCategories: async () => {
    const { groupId } = get();
    let categories: ForumCategory[] = [];
    let archivedCategories: ForumCategory[] = [];

    try {
      // Load active categories
      const activeResponse = await forumsService.getGroupForumCategories(groupId, false);
      categories = activeResponse.data;

      // Load archived categories
      const archivedResponse = await forumsService.getGroupForumCategories(groupId, true);
      archivedCategories = archivedResponse.data;
    } catch (e) {
      // we handle this in the Categories
    }

    set(
      {
        categories,
        archivedCategories,
        categoriesLoaded: true
      },
      undefined,
      'content/loadCategories'
    );
  }
});

export default createContentSlice;
