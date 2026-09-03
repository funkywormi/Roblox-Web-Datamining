import { TGetGameTransactionsResponse } from "../types/developerProductTypes";

export default function mapDeveloperProductsAndReceipts(
  transactions: TGetGameTransactionsResponse,
): Map<number, number> {
  const productsToReceiptCountMap = new Map<number, number>();
  transactions.forEach(transaction => {
    // productId is stored as a key/val pair in the actionArgs array in the transaction
    const productId = parseInt(
      transaction.actionArgs.find(arg => arg.Key === "productId")?.Value ?? "",
      10,
    );
    if (productId) {
      // adds this product to the map or increments its receipt count by 1
      productsToReceiptCountMap.set(productId, (productsToReceiptCountMap.get(productId) ?? 0) + 1);
    }
  });
  return productsToReceiptCountMap;
}
