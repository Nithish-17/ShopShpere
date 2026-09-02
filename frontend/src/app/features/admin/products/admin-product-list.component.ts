import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../products/services/product.service';
import { CategoryService } from '../../products/services/category.service';
import { ProductResponse, CategoryResponse, ProductRequest } from '../../../core/models';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { ProductImageManagerComponent } from './components/product-image-manager/product-image-manager.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyInrPipe,
    ButtonComponent,
    ModalComponent,
    PaginationComponent,
    SpinnerComponent,
    FormErrorComponent,
    ProductImageManagerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-products-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Product Catalog Management</h1>
          <p class="page-subtitle">Create, update, price, and maintain hardware catalog items</p>
        </div>
        <app-button variant="primary" (clicked)="openCreateModal()">
          + Add New Product
        </app-button>
      </div>

      @if (loading()) {
        <app-spinner [fullPage]="true" message="Loading product list..."></app-spinner>
      } @else {
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (prod of products(); track prod.id) {
                <tr>
                  <td>#{{ prod.id }}</td>
                  <td class="font-bold">{{ prod.name }}</td>
                  <td>{{ prod.brand }}</td>
                  <td>
                    <span class="category-tag">{{ prod.categoryName }}</span>
                  </td>
                  <td>{{ prod.price | currencyInr }}</td>
                  <td>
                    <div class="actions-group">
                      <button type="button" class="btn-action-icon" (click)="openImageManager(prod)" title="Manage Images">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      </button>
                      <button type="button" class="btn-action-icon" (click)="openEditModal(prod)" title="Edit Product">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button type="button" class="btn-action-icon text-danger" (click)="deleteProduct(prod.id)" title="Delete Product">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <app-pagination
          [currentPage]="currentPage()"
          [totalPages]="totalPages()"
          (pageChange)="onPageChange($event)"
        ></app-pagination>
      }

      <!-- Add/Edit Product Modal -->
      <app-modal
        [isOpen]="isModalOpen()"
        [title]="editingProductId() ? 'Edit Product #' + editingProductId() : 'Add New Product'"
        [size]="'lg'"
        (closed)="closeModal()"
      >
        <form [formGroup]="productForm" (ngSubmit)="saveProduct()" id="productForm" novalidate>
          <div class="form-group">
            <label class="form-label" for="prodName">Product Name</label>
            <input
              id="prodName"
              type="text"
              class="form-control"
              [class.is-invalid]="nameControl?.invalid && (nameControl?.dirty || nameControl?.touched)"
              formControlName="name"
              placeholder="e.g. MacBook Pro 16 M3 Max"
            />
            <app-form-error [control]="nameControl" fieldName="Product Name"></app-form-error>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="prodBrand">Brand</label>
              <input
                id="prodBrand"
                type="text"
                class="form-control"
                [class.is-invalid]="brandControl?.invalid && (brandControl?.dirty || brandControl?.touched)"
                formControlName="brand"
                placeholder="e.g. Apple"
              />
              <app-form-error [control]="brandControl" fieldName="Brand"></app-form-error>
            </div>

            <div class="form-group">
              <label class="form-label" for="prodPrice">Price (INR)</label>
              <input
                id="prodPrice"
                type="number"
                step="0.01"
                min="0.01"
                class="form-control"
                [class.is-invalid]="priceControl?.invalid && (priceControl?.dirty || priceControl?.touched)"
                formControlName="price"
                placeholder="e.g. 249999.00"
              />
              <app-form-error [control]="priceControl" fieldName="Price"></app-form-error>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="prodCategory">Category</label>
            <select
              id="prodCategory"
              class="form-select"
              [class.is-invalid]="categoryControl?.invalid && (categoryControl?.dirty || categoryControl?.touched)"
              formControlName="categoryId"
            >
              <option [ngValue]="null" disabled>Select a category</option>
              @for (cat of categories(); track cat.id) {
                <option [ngValue]="cat.id">{{ cat.name }}</option>
              }
            </select>
            <app-form-error [control]="categoryControl" fieldName="Category"></app-form-error>
          </div>

          <div class="form-group">
            <label class="form-label" for="prodDesc">Description</label>
            <textarea
              id="prodDesc"
              rows="4"
              class="form-control"
              formControlName="description"
              placeholder="Detailed product specifications and highlights..."
            ></textarea>
          </div>
        </form>

        <div modal-footer>
          <app-button variant="secondary" (clicked)="closeModal()">Cancel</app-button>
          <app-button
            variant="primary"
            [disabled]="productForm.invalid || isSaving()"
            [loading]="isSaving()"
            (clicked)="saveProduct()"
          >
            {{ editingProductId() ? 'Save Changes' : 'Create Product' }}
          </app-button>
        </div>
      </app-modal>

      <!-- Media Gallery Modal -->
      @if (selectedProductForImages()) {
        <app-product-image-manager
          [isOpen]="isImageManagerOpen()"
          [productId]="selectedProductForImages()!.id"
          [productName]="selectedProductForImages()!.name"
          (closed)="isImageManagerOpen.set(false)"
        ></app-product-image-manager>
      }
    </div>
  `,
  styles: [`
    .admin-products-page {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
    }

    .page-subtitle {
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
      margin-top: 0.25rem;
    }

    .font-bold {
      font-weight: 700;
    }

    .category-tag {
      font-size: 0.75rem;
      font-weight: 600;
      background-color: var(--color-bg-muted);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-full);
    }

    .actions-group {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .btn-action-icon {
      width: 2rem;
      height: 2rem;
      border: 1px solid var(--color-border);
      background-color: var(--color-bg-surface);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-text-secondary);
      transition: all var(--transition-fast);
    }

    .btn-action-icon:hover {
      border-color: var(--color-brand);
      color: var(--color-brand);
      background-color: var(--color-bg-muted);
    }

    .btn-action-icon.text-danger:hover {
      border-color: var(--color-danger);
      color: var(--color-danger);
      background-color: var(--color-danger-bg);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export default class AdminProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(FormBuilder);
  private readonly notification = inject(NotificationService);

  products = signal<ProductResponse[]>([]);
  categories = signal<CategoryResponse[]>([]);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);
  currentPage = signal<number>(0);

  loading = signal<boolean>(true);
  isModalOpen = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  editingProductId = signal<number | null>(null);

  isImageManagerOpen = signal<boolean>(false);
  selectedProductForImages = signal<ProductResponse | null>(null);

  productForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    brand: ['', [Validators.required, Validators.maxLength(100)]],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]],
    categoryId: [null as number | null, [Validators.required]],
    description: ['']
  });

  get nameControl() { return this.productForm.get('name'); }
  get brandControl() { return this.productForm.get('brand'); }
  get priceControl() { return this.productForm.get('price'); }
  get categoryControl() { return this.productForm.get('categoryId'); }

  ngOnInit(): void {
    this.categoryService.getAllCategories().subscribe({
      next: cats => this.categories.set(cats),
      error: () => {}
    });

    this.fetchProducts();
  }

  fetchProducts(): void {
    this.loading.set(true);
    this.productService.getProducts(this.currentPage(), 10, 'id,asc').subscribe({
      next: page => {
        this.products.set(page.content || []);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreateModal(): void {
    this.editingProductId.set(null);
    this.productForm.reset({
      name: '',
      brand: '',
      price: null,
      categoryId: null,
      description: ''
    });
    this.isModalOpen.set(true);
  }

  openEditModal(product: ProductResponse): void {
    this.editingProductId.set(product.id);
    this.productForm.patchValue({
      name: product.name,
      brand: product.brand,
      price: product.price,
      categoryId: product.categoryId,
      description: product.description || ''
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.productForm.value;
    const request: ProductRequest = {
      name: formValue.name!,
      brand: formValue.brand!,
      price: Number(formValue.price!),
      categoryId: Number(formValue.categoryId!),
      description: formValue.description || ''
    };

    const editId = this.editingProductId();

    if (editId) {
      this.productService.updateProduct(editId, request).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.isModalOpen.set(false);
          this.notification.success(`Product #${editId} updated successfully.`);
          this.fetchProducts();
        },
        error: () => this.isSaving.set(false)
      });
    } else {
      this.productService.createProduct(request).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.isModalOpen.set(false);
          this.notification.success('Product created successfully.');
          this.fetchProducts();
        },
        error: () => this.isSaving.set(false)
      });
    }
  }

  deleteProduct(productId: number): void {
    if (confirm(`Are you sure you want to delete product #${productId}?`)) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.notification.info(`Product #${productId} deleted.`);
          this.fetchProducts();
        }
      });
    }
  }

  openImageManager(product: ProductResponse): void {
    this.selectedProductForImages.set(product);
    this.isImageManagerOpen.set(true);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.fetchProducts();
  }
}
