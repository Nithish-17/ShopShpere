export interface ProductRequest {
  name: string;
  description?: string;
  brand: string;
  price: number;
  categoryId: number;
}

export interface ProductResponse {
  id: number;
  name: string;
  description?: string;
  brand: string;
  price: number;
  categoryId: number;
  categoryName: string;
}

export interface ProductSearchRequest {
  keyword?: string;
  categoryId?: number;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ProductImageResponse {
  id: number;
  fileName: string;
  originalFileName: string;
  contentType?: string;
  fileSize?: number;
  url: string; // Formatted as '/api/products/{productId}/images/{imageId}'
}
