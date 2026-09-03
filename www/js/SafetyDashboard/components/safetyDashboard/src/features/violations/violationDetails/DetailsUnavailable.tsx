import { useTranslation } from "@rbx/core-scripts/react";

/**
 * Generic fallback copy shown for LIMITED violations where we have no
 * structured content, evidence, abuse types, or moderator note to display.
 * Centralized here so the className + translation key live in one place
 * (used by both WhatHappened and the ActivityReviewed Evidence component).
 */
const DetailsUnavailable = () => {
  const { translate } = useTranslation();
  return <p className="text-body-medium">{translate("Description.DetailsUnavailable")}</p>;
};

export default DetailsUnavailable;
