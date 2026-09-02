import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProductImageResponse } from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class ProductImageService {
  private readonly http = inject(HttpClient);

  getImages(productId: number): Observable<ProductImageResponse[]> {
    return this.http.get<ProductImageResponse[]>(
      `${environment.apiUrl}/products/${productId}/images`
    );
  }

  uploadImage(productId: number, file: File): Observable<ProductImageResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ProductImageResponse>(
      `${environment.apiUrl}/products/${productId}/images`,
      formData
    );
  }

  deleteImage(productId: number, imageId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/products/${productId}/images/${imageId}`
    );
  }

  getImageUrl(relativeUrl: string): string {
    if (!relativeUrl) return '';
    if (relativeUrl.startsWith('http')) return relativeUrl;
    // URL in ProductImageResponse is e.g. /api/products/1/images/2
    return relativeUrl;
  }
}
