import { CatalogQuery } from './catalogQuery.types';

const countCatalogQueryDifferences = (query1: CatalogQuery, query2: CatalogQuery): number =>
  (Object.keys(query1) as (keyof CatalogQuery)[])
    .filter(key => key !== 'topicBasedBrowsingEnabledForCategory' && key !== 'keyword')
    .reduce((count, key) => {
      const query1Value = query1[key];
      const query2Value = query2[key];
      if (!query1Value && !query2Value) {
        return count;
      }
      let isDifferent = JSON.stringify(query1Value) !== JSON.stringify(query2Value);
      // Only count subcategory difference if the category is the same.
      if (key === 'subcategory' && isDifferent && query1.category !== query2.category) {
        isDifferent = false;
      }

      return isDifferent ? count + 1 : count;
    }, 0);

export default countCatalogQueryDifferences;
