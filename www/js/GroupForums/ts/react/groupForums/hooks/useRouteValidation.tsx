import { useEffect } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import useForumStore from './useForumStore';
import { RouteMatchType } from '../store/reduceNextRoute';
import routeValidation from '../utils/routeValidation';

const useRouteValidation = (enabled: boolean, postName?: string): void => {
  const match = useRouteMatch<RouteMatchType>();
  const history = useHistory();
  const onRouteChange = useForumStore.use.onRouteChange();
  const categoriesLoaded = useForumStore.use.categoriesLoaded();
  const categoryShortId = useForumStore.use.categoryShortId();
  const postShortId = useForumStore.use.postShortId();
  const categoryName = useForumStore.use.categoryName();

  useEffect(() => {
    // eslint-disable-next-line no-void
    void onRouteChange(match);
  }, [match, onRouteChange, categoriesLoaded]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Prevent infinite loop of replacements
    if (history.action === 'PUSH' || history.action === 'REPLACE') {
      return;
    }

    const { params } = match;
    const updatedRoute = routeValidation(params, {
      categoryShortId,
      categoryName,
      postShortId,
      postName,
      categoriesLoaded
    });

    if (updatedRoute) {
      history.replace(updatedRoute);
    }
  }, [
    enabled,
    match,
    history,
    categoryShortId,
    categoryName,
    postShortId,
    categoriesLoaded,
    postName
  ]);
};

export default useRouteValidation;
