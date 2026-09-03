import { CurrentUser } from "@rbx/core-scripts/legacy/Roblox";
import { EnvironmentUrls } from "@rbx/environment-urls";
import { RecipientEligibilityType } from "../services/giftingProductsService";
import { Product } from "../constants/TypeDefinitions";
import { DEFAULT_USER_ID } from "../constants/Constants";

export function isEmptyUser(userId: number | null): boolean {
  const queryParams = new URLSearchParams(window.location.search);
  if (!queryParams.get("user")) {
    return true;
  }

  return userId === DEFAULT_USER_ID;
}

export function canUpdateMetadata(eligibilityType: RecipientEligibilityType): boolean {
  if (!CurrentUser?.isAuthenticated) {
    return false;
  }

  return eligibilityType === RecipientEligibilityType.Unspecified;
}

export function getDefaultEligibilityType(): RecipientEligibilityType {
  return RecipientEligibilityType.Unspecified;
}

export function getDefaultGiftingUrl(userId: string): string {
  return `${EnvironmentUrls.websiteUrl}/gift-robux?user=${userId}`;
}

export function filterProducts(products: Product[]): Product[] {
  return products.filter(
    product => !product.isSubscriptionOnly && product.premiumFeatureTypeName === "Robux",
  );
}
