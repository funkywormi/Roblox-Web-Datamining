/**
 * Utility functions for handling taxonomy data that can be either string or string[]
 */

/**
 * Extracts taxonomy value from either string or string[] format
 * @param taxonomy - The taxonomy field that can be string, string[], or undefined
 * @returns The first taxonomy string, or undefined if not available
 */
export const getTaxonomy = (taxonomy: string | string[] | undefined): string | undefined => {
  if (!taxonomy) return undefined;
  if (Array.isArray(taxonomy)) {
    return taxonomy[0]; // Get first element from array
  }
  return taxonomy; // Return the string directly
};

/**
 * Converts taxonomy to array format for query parameters
 * @param taxonomy - The taxonomy field that can be string, string[], or undefined
 * @returns Array of taxonomy strings, empty array if not available
 */
export const taxonomyToArray = (taxonomy: string | string[] | undefined): string[] => {
  if (!taxonomy) return [];
  if (Array.isArray(taxonomy)) return taxonomy;
  return [taxonomy]; // Convert string to array
};

/**
 * Checks if a taxonomy field contains a specific taxonomy value
 * @param taxonomy - The taxonomy field to search in (string, string[], or undefined)
 * @param targetTaxonomy - The taxonomy value to search for
 * @returns True if the taxonomy contains the target value
 */
export const taxonomyContains = (
  taxonomy: string | string[] | undefined,
  targetTaxonomy: string
): boolean => {
  if (!taxonomy) return false;
  if (Array.isArray(taxonomy)) {
    return taxonomy.includes(targetTaxonomy);
  }
  return taxonomy === targetTaxonomy;
};

/**
 * Gets a unique identifier for a category, preferring taxonomy but falling back to categoryId
 * @param category - The category object
 * @returns A string identifier for the category
 */
export const getCategoryIdentifier = (category: {
  taxonomy?: string | string[];
  categoryId: number;
}): string => {
  const taxonomy = getTaxonomy(category.taxonomy);
  return taxonomy || `category-${category.categoryId}`;
};

/**
 * Gets a unique identifier for a subcategory, preferring taxonomy but falling back to subcategoryId
 * @param subcategory - The subcategory object
 * @returns A string identifier for the subcategory
 */
export const getSubcategoryIdentifier = (subcategory: {
  taxonomy?: string | string[];
  subcategoryId: number;
}): string => {
  const taxonomy = getTaxonomy(subcategory.taxonomy);
  return taxonomy || `subcategory-${subcategory.subcategoryId}`;
};

/**
 * Checks if an identifier represents a fallback ID (not taxonomy)
 * @param identifier - The identifier to check
 * @returns True if this is a fallback ID (category-X or subcategory-X)
 */
export const isFallbackIdentifier = (identifier: string): boolean => {
  return identifier.startsWith('category-') || identifier.startsWith('subcategory-');
};

/**
 * Extracts the numeric ID from a fallback identifier
 * @param identifier - The fallback identifier (e.g., "category-123" or "subcategory-456")
 * @returns The numeric ID, or null if not a valid fallback identifier
 */
export const extractIdFromFallback = (identifier: string): number | null => {
  const regex = /^(?:category|subcategory)-(\d+)$/;
  const match = regex.exec(identifier);
  return match ? parseInt(match[1], 10) : null;
};
