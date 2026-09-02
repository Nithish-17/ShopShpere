import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CategoryRequest, CategoryResponse, Page, ProductResponse } from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private categoriesCache$?: Observable<CategoryResponse[]>;

  getAllCategories(forceRefresh = false): Observable<CategoryResponse[]> {
    if (!this.categoriesCache$ || forceRefresh) {
      this.categoriesCache$ = this.http
        .get<CategoryResponse[]>(`${environment.apiUrl}/categories`)
        .pipe(shareReplay(1));
    }
    return this.categoriesCache$;
  }

  getCategoryById(id: number): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${environment.apiUrl}/categories/${id}`);
  }

  createCategory(request: CategoryRequest): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(`${environment.apiUrl}/categories`, request);
  }

  updateCategory(id: number, request: CategoryRequest): Observable<CategoryResponse> {
    return this.http.put<CategoryResponse>(`${environment.apiUrl}/categories/${id}`, request);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/categories/${id}`);
  }

  getProductsByCategory(
    categoryId: number,
    page = 0,
    size = 10,
    sort = 'name,asc'
  ): Observable<Page<ProductResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<Page<ProductResponse>>(
      `${environment.apiUrl}/categories/${categoryId}/products`,
      { params }
    );
  }
}
