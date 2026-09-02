export interface InventoryRequest {
  productId: number;
  quantity: number;
  minimumStock: number;
  maximumStock: number;
}

export interface StockUpdateRequest {
  quantity: number;
}

export interface InventoryResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minimumStock: number;
  maximumStock: number;
}
