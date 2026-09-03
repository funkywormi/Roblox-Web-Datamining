export const AGE_CHECK_VPC_FEATURE_NAME = "TriggerAgeCheckUpsellIncludingVPC";
export const AGE_CHECK_VPC_NAMESPACE = "core_content/CoreContent";
export const EDP_UPSELL_ICON_CLASS_NAME = "icon-regular-lock-closed";

export const edpUpsellCounterEvents = {
  AccessManagementServiceMissing: "EdpUpsellAccessManagementServiceMissing",
  StartUpsellFailed: "EdpUpsellStartAccessManagementUpsellFailed",
  InvalidatePlayabilityQueryFailed: "EdpUpsellInvalidatePlayabilityQueryFailed",
};

const gameDetailsEdpUpsellContainerId = "game-details-edp-upsell-container";
const gameDetailsEdpUpsellContainer = (): HTMLElement | null =>
  document.getElementById(gameDetailsEdpUpsellContainerId);

export default {
  gameDetailsEdpUpsellContainerId,
  gameDetailsEdpUpsellContainer,
};
