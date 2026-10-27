import React from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";

type TGameStorePreviewProps = {
  translate: TranslateFunction;
};

const GameStorePreview = ({ translate }: TGameStorePreviewProps): JSX.Element => {
  return <div className="game-store-preview" />;
};

export default GameStorePreview;
