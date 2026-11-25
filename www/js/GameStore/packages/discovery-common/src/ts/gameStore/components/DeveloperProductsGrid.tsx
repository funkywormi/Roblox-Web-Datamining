import React from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { Pagination } from "@rbx/core-ui";
import { TGetGameDetails } from "../../common/types/bedev1Types";
import DeveloperProductCard from "./DeveloperProductCard";
import { TDeveloperProduct } from "../types/developerProductTypes";

type TDeveloperProductsGridProps = {
  translate: TranslateFunction;
  developerProducts: TDeveloperProduct[];
  gameDetails: TGetGameDetails;
  resultsPerPage: number;
  currentPage: number;
  onChangePage: (newPage: number) => void;
  numDeveloperProducts: number;
};

const DeveloperProductsGrid = ({
  translate,
  developerProducts,
  gameDetails,
  resultsPerPage,
  currentPage,
  onChangePage,
  numDeveloperProducts,
}: TDeveloperProductsGridProps) => {
  const numPages = Math.ceil(numDeveloperProducts / resultsPerPage);
  const pagination =
    numDeveloperProducts > resultsPerPage ? (
      <div className="overview-pagination-container">
        <Pagination current={currentPage} total={numPages} onChange={onChangePage} hasNext />
      </div>
    ) : null;

  return (
    <React.Fragment>
      <ul className="hlist store-cards store-developer-products-row">
        {developerProducts.map(product => (
          <DeveloperProductCard
            developerProduct={product}
            sellerName={gameDetails.creator.name}
            sellerId={gameDetails.creator.id}
            translate={translate}
            universeId={gameDetails.id}
            key={product.targetId}
          />
        ))}
      </ul>
      {pagination}
    </React.Fragment>
  );
};

export default DeveloperProductsGrid;
