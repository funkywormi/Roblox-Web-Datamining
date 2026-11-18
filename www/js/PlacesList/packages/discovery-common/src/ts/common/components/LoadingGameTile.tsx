import React from "react";
import "../../../css/common/gameTiles.css";

export const LoadingGameTile = (): JSX.Element => {
  return (
    <div className="grid-item-container game-card-container game-card-loading">
      <div className="game-card-thumb-container shimmer" />
      <div className="game-card-name game-name-title shimmer" />
      <div className="game-card-name game-name-title game-name-title-half shimmer" />
    </div>
  );
};

export default LoadingGameTile;
