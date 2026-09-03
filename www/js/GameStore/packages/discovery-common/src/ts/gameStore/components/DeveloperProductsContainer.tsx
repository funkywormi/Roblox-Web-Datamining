import React, { useEffect, useMemo, useState } from "react";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import metadataConstants from "../../gameDetails/constants/metadataConstants";
import { FeatureDeveloperProducts } from "../../common/constants/translationConstants";
import { TDeveloperProduct } from "../types/developerProductTypes";
import DeveloperProductsGrid from "./DeveloperProductsGrid";
import { developerProductsTranslationConfig } from "../translation.config";
import developerProductServices from "../services/developerProductServices";
import sortDeveloperProductFn from "../utils/sortDeveloperProductFn";
import useGameDetailsForUniverseId from "../../gameDetails/hooks/useGameDetailsForUniverseId";

const DEVELOPER_PRODUCTS_PAGE_SIZE = 200;
const DEVELOPER_PRODUCTS_MAX_PAGE = 50; // to prevent infinite loading
const CARDS_PER_ROW_MIN = 3;
const CARDS_PER_ROW_MAX = 6;
const ROWS_PER_PAGE = 2;
const CARD_BREAK_POINTS = [0, 0, 0, 0, 544, 768, 992]; // Min screen width in pixels that allows [index] number of cards in one row

const DeveloperProductsContainer = ({ translate }: WithTranslationsProps): JSX.Element => {
  const { universeId = "" } = metadataConstants.metadataData() || {};

  const [developerProducts, setDeveloperProducts] = useState<TDeveloperProduct[] | undefined>(
    undefined,
  );
  const [pendingDeveloperProducts, setPendingDeveloperProducts] = useState<
    Map<number, number> | undefined
  >(undefined);

  const [loadingProducts, setLoadingProducts] = useState(true);

  const authenticatedUserId: number = authenticatedUser()?.id ?? 0;

  // For pagination component logic
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(CARDS_PER_ROW_MAX * ROWS_PER_PAGE);

  const { gameDetails } = useGameDetailsForUniverseId(universeId);

  // Effect to set up the listener and update resultsPerPage on resize
  useEffect(() => {
    const updateResultsPerPage = () => {
      let cardsToFit = 0;
      const { innerWidth } = window;
      for (let x = CARD_BREAK_POINTS.length - 1; x >= 0; x--) {
        if (innerWidth >= CARD_BREAK_POINTS[x]!) {
          cardsToFit = x;
          break;
        }
      }

      const newResultsPerPage =
        Math.min(Math.max(cardsToFit, CARDS_PER_ROW_MIN), CARDS_PER_ROW_MAX) * ROWS_PER_PAGE;
      setResultsPerPage(newResultsPerPage); // Limit max to 6, or fewer if screen is smaller
      // go back to last valid page if current page is invalid
      if (developerProducts?.length) {
        const newTotalPages = Math.ceil(developerProducts.length / newResultsPerPage);
        setCurrentPage(oldCurrentPage => {
          if (oldCurrentPage > newTotalPages) {
            return newTotalPages;
          }
          return oldCurrentPage;
        });
      }
    };
    updateResultsPerPage(); // Initial update on load
    window.addEventListener("resize", updateResultsPerPage); // Update on window resize
    return () => {
      window.removeEventListener("resize", updateResultsPerPage); // Clean up on refresh or unmount
    };
  }, [developerProducts]);

  useEffect(() => {
    if (gameDetails?.rootPlaceId && authenticatedUserId) {
      developerProductServices
        .getPendingDeveloperProducts(gameDetails.rootPlaceId, authenticatedUserId)
        .then(data => setPendingDeveloperProducts(data))
        .catch(() => setPendingDeveloperProducts(new Map<number, number>()));
    }
  }, [gameDetails?.rootPlaceId, authenticatedUserId]);

  const loadAllDeveloperProducts = async () => {
    const loadedDeveloperProducts: TDeveloperProduct[] = [];
    let cursor = "";
    /* eslint-disable no-await-in-loop */
    for (let page = 0; page < DEVELOPER_PRODUCTS_MAX_PAGE; page++) {
      const { nextPageCursor, developerProducts: newProducts } =
        await developerProductServices.getDeveloperProductsByUniverseId(
          parseInt(universeId, 10),
          DEVELOPER_PRODUCTS_PAGE_SIZE,
          cursor,
        );
      loadedDeveloperProducts.push(...newProducts);
      if (!nextPageCursor) break;
      cursor = nextPageCursor;
    }
    /* eslint-enable no-await-in-loop */
    return loadedDeveloperProducts;
  };

  useEffect(() => {
    if (loadingProducts && universeId !== "") {
      loadAllDeveloperProducts()
        .then(loadedDeveloperProducts => {
          setDeveloperProducts(loadedDeveloperProducts);
        })
        .catch(() => setDeveloperProducts([]))
        .finally(() => setLoadingProducts(false));
    }
  }, [loadingProducts, universeId]);

  const developerProductsSorted = useMemo(() => {
    if (
      loadingProducts ||
      developerProducts === undefined ||
      pendingDeveloperProducts === undefined
    ) {
      return undefined;
    }
    const withPending = developerProducts
      .filter(product => pendingDeveloperProducts.has(product.productId))
      .sort(sortDeveloperProductFn);
    const withoutPending = developerProducts
      .filter(product => !pendingDeveloperProducts.has(product.productId))
      .sort(sortDeveloperProductFn);
    return withPending.concat(withoutPending);
  }, [developerProducts, pendingDeveloperProducts, loadingProducts]);

  const pageProducts = useMemo(
    () =>
      developerProductsSorted?.slice(
        (currentPage - 1) * resultsPerPage,
        Math.min(currentPage * resultsPerPage, developerProductsSorted.length),
      ),
    [developerProductsSorted, currentPage, resultsPerPage],
  );

  /**
   * @jerrylai 9/19/2024: this will hide this component for non-enabled users. upon wide release, replace with the following:
   *   if (developerProducts === undefined || gameDetails === undefined) {
   *     return <Loading />;
   *   }
   *
   *   if (developerProducts.length === 0) {
   *     return (
   *       <div className='section-content-off'>
   *         {translate(FeatureDeveloperProducts.LabelNoProducts)}
   *       </div>
   *     );
   *   }
   */
  if (
    loadingProducts ||
    pageProducts === undefined ||
    developerProductsSorted === undefined ||
    developerProducts === undefined ||
    gameDetails === undefined ||
    pendingDeveloperProducts === undefined ||
    developerProducts.length === 0
  ) {
    return <React.Fragment />;
  }

  return (
    <React.Fragment>
      <div className="container-header">
        <h2>{translate(FeatureDeveloperProducts.HeadingProducts)}</h2>
      </div>
      <DeveloperProductsGrid
        translate={translate}
        developerProducts={pageProducts}
        gameDetails={gameDetails}
        pendingDeveloperProducts={pendingDeveloperProducts}
        resultsPerPage={resultsPerPage}
        currentPage={currentPage}
        onChangePage={setCurrentPage}
        numDeveloperProducts={developerProducts.length}
      />
    </React.Fragment>
  );
};

export default withTranslations(DeveloperProductsContainer, developerProductsTranslationConfig);
