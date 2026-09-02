import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject, signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductImageService } from '../../../../products/services/product-image.service';
import { ProductImageResponse } from '../../../../../core/models';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';
import { ImageFallbackDirective } from '../../../../../shared/directives/image-fallback.directive';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-product-image-manager',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    ButtonComponent,
    SpinnerComponent,
    ImageFallbackDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal
      [isOpen]="isOpen"
      [title]="'Media Gallery: ' + productName"
      [size]="'lg'"
      (closed)="onClose()"
    >
      <div class="image-manager-body">
        <!-- Upload Box -->
        <div class="upload-zone">
          <input
            #fileInput
            type="file"
            accept="image/*"
            class="hidden-file-input"
            (change)="onFileSelected($event)"
          />
          <div class="upload-drop-content" (click)="fileInput.click()">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <span class="upload-text">Click to upload product image</span>
            <span class="upload-hint">Supports JPEG, PNG, WEBP (Max 10MB)</span>
          </div>
        </div>

        <!-- Loading State -->
        @if (loading()) {
          <app-spinner size="sm" message="Syncing images..."></app-spinner>
        } @else if (images().length === 0) {
          <div class="no-images-notice">
            No images uploaded yet for this product.
          </div>
        } @else {
          <!-- Existing Images Grid -->
          <div class="images-grid">
            @for (img of images(); track img.id) {
              <div class="image-item-card">
                <div class="thumb-container">
                  <img [src]="img.url" [alt]="img.originalFileName" appImageFallback />
                </div>
                <div class="thumb-info">
                  <span class="file-name" [title]="img.originalFileName">{{ img.originalFileName }}</span>
                  <button
                    type="button"
                    class="btn-delete-img"
                    [disabled]="deletingId() === img.id"
                    (click)="deleteImage(img.id)"
                    aria-label="Delete image"
                  >
                    @if (deletingId() === img.id) {
                      <span class="spinner-tiny"></span>
                    } @else {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    }
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <div modal-footer>
        <app-button variant="secondary" (clicked)="onClose()">Done</app-button>
      </div>
    </app-modal>
  `,
  styles: [`
    .image-manager-body {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .upload-zone {
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      text-align: center;
      background-color: var(--color-bg-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .upload-zone:hover {
      border-color: var(--color-brand);
      background-color: #f8fafc;
    }

    .hidden-file-input {
      display: none;
    }

    .upload-drop-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      color: var(--color-text-secondary);
    }

    .upload-text {
      font-weight: 700;
      font-size: 0.9375rem;
      color: var(--color-brand);
    }

    .upload-hint {
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }

    .no-images-notice {
      text-align: center;
      color: var(--color-text-muted);
      padding: var(--space-6);
      font-size: 0.875rem;
    }

    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-4);
    }

    .image-item-card {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      background-color: var(--color-bg-surface);
      display: flex;
      flex-direction: column;
    }

    .thumb-container {
      width: 100%;
      height: 110px;
      background-color: var(--color-bg-muted);
      overflow: hidden;
    }

    .thumb-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .thumb-info {
      padding: var(--space-2) var(--space-3);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
      border-top: 1px solid var(--color-border);
    }

    .file-name {
      font-size: 0.75rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--color-text-secondary);
    }

    .btn-delete-img {
      background: none;
      border: none;
      color: var(--color-danger);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner-tiny {
      width: 0.875rem;
      height: 0.875rem;
      border: 2px solid rgba(239, 68, 68, 0.2);
      border-top-color: var(--color-danger);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
  `]
})
export class ProductImageManagerComponent implements OnInit, OnChanges {
  @Input() productId = 0;
  @Input() productName = '';
  @Input() isOpen = false;

  @Output() closed = new EventEmitter<void>();

  private readonly imageService = inject(ProductImageService);
  private readonly notification = inject(NotificationService);

  images = signal<ProductImageResponse[]>([]);
  loading = signal<boolean>(false);
  deletingId = signal<number | null>(null);

  ngOnInit(): void {
    if (this.productId) {
      this.loadImages();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && this.productId) {
      this.loadImages();
    }
  }

  loadImages(): void {
    this.loading.set(true);
    this.imageService.getImages(this.productId).subscribe({
      next: imgs => {
        this.images.set(imgs);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.loading.set(true);

      this.imageService.uploadImage(this.productId, file).subscribe({
        next: () => {
          this.notification.success('Image uploaded successfully.');
          this.loadImages();
        },
        error: () => this.loading.set(false)
      });
    }
  }

  deleteImage(imageId: number): void {
    this.deletingId.set(imageId);

    this.imageService.deleteImage(this.productId, imageId).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.notification.info('Image deleted.');
        this.loadImages();
      },
      error: () => this.deletingId.set(null)
    });
  }

  onClose(): void {
    this.closed.emit();
  }
}
