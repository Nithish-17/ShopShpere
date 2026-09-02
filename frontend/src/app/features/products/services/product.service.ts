import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ProductRequest,
  ProductResponse,
  ProductSearchRequest,
  Page
} from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);

  getProducts(page = 0, size = 12, sort = 'name,asc'): Observable<Page<ProductResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<Page<ProductResponse>>(`${environment.apiUrl}/products`, { params });
  }

  getProductById(id: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${environment.apiUrl}/products/${id}`);
  }

  searchProducts(search: ProductSearchRequest): Observable<Page<ProductResponse>> {
    let params = new HttpParams()
      .set('page', (search.page ?? 0).toString())
      .set('size', (search.size ?? 12).toString())
      .set('sort', search.sort ?? 'name,asc');

    if (search.keyword && search.keyword.trim().length > 0) {
      params = params.set('keyword', search.keyword.trim());
    }
    if (search.categoryId !== undefined && search.categoryId !== null) {
      params = params.set('categoryId', search.categoryId.toString());
    }
    if (search.brand && search.brand.trim().length > 0) {
      params = params.set('brand', search.brand.trim());
    }
    if (search.minPrice !== undefined && search.minPrice !== null) {
      params = params.set('minPrice', search.minPrice.toString());
    }
    if (search.maxPrice !== undefined && search.maxPrice !== null) {
      params = params.set('maxPrice', search.maxPrice.toString());
    }
    if (search.inStock !== undefined && search.inStock !== null) {
      params = params.set('inStock', search.inStock.toString());
    }

    return this.http.get<Page<ProductResponse>>(`${environment.apiUrl}/products/search`, { params });
  }

  createProduct(request: ProductRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(`${environment.apiUrl}/products`, request);
  }

  updateProduct(id: number, request: ProductRequest): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${environment.apiUrl}/products/${id}`, request);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/products/${id}`);
  }
}
