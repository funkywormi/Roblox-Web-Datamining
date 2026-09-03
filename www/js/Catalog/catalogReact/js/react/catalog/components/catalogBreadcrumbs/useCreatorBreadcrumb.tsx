import { useState, useEffect } from 'react';
import { CatalogQuery } from '../../hooks/catalogQuery/catalogQuery.types';
import { SearchOptionsData } from '../../hooks/searchOptions/searchOptions.types';

const useCreatorBreadcrumb = (searchOptions: SearchOptionsData, catalogQuery: CatalogQuery) => {
  const { defaultCreatorId } = searchOptions;

  const [creatorBreadcrumb, setCreatorBreadcrumb] = useState<string | null>();
  const [customCreatorSelected, setCustomCreatorSelected] = useState<boolean | undefined>();

  useEffect(() => {
    const { creatorName, creator } = catalogQuery;

    const customCreator = !!creator && creator.userId !== defaultCreatorId;

    if (creatorName) {
      setCreatorBreadcrumb(creatorName);
    } else {
      setCreatorBreadcrumb(customCreator ? creator?.name : null);
    }

    setCustomCreatorSelected(customCreator);
  }, [catalogQuery, defaultCreatorId]);

  const [showCreatorBreadcrumb, setShowCreatorBreadcrumb] = useState<boolean | undefined>(false);

  useEffect(() => {
    setShowCreatorBreadcrumb(
      !!(customCreatorSelected && creatorBreadcrumb && creatorBreadcrumb.length > 0)
    );
  }, [customCreatorSelected, creatorBreadcrumb]);

  const [isCreatorAGroup, setIsCreatorAGroup] = useState<boolean | undefined>();

  return {
    showCreatorBreadcrumb,
    isCreatorAGroup,
    creatorBreadcrumb
  };
};

export default useCreatorBreadcrumb;
