import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../products/services/product.service';
import { AdminInventoryService } from '../services/admin-inventory.service';
import { ProductResponse, InventoryRequest } from '../../../core/models';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    ModalComponent,
    SpinnerComponent,
    PaginationComponent,
    FormErrorComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-inventory-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Inventory & Stock Control</h1>
          <p class="page-subtitle">Initialize stock balances and adjust physical product inventory levels</p>
        </div>
      </div>

      @if (loading()) {
        <app-spinner [fullPage]="true" message="Loading inventory overview..."></app-spinner>
      } @else {
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Quick Actions</th>
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
                  <td>
                    <div class="inventory-actions">
                      <button
                        type="button"
                        class="btn-stock-action btn-init"
                        (click)="openInitModal(prod)"
                      >
                        Initialize Stock
                      </button>
                      <button
                        type="button"
                        class="btn-stock-action btn-inc"
                        (click)="openAdjustModal(prod, 'increase')"
                      >
                        + Increase Stock
                      </button>
                      <button
                        type="button"
                        class="btn-stock-action btn-dec"
                        (click)="openAdjustModal(prod, 'decrease')"
                      >
                        - Decrease Stock
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

      <!-- Initialize Inventory Modal -->
      <app-modal
        [isOpen]="isInitModalOpen()"
        [title]="'Initialize Inventory for ' + selectedProduct()?.name"
        (closed)="isInitModalOpen.set(false)"
      >
        <form [formGroup]="initForm" (ngSubmit)="submitInitInventory()" novalidate>
          <div class="form-group">
            <label class="form-label" for="initQty">Initial Quantity</label>
            <input
              id="initQty"
              type="number"
              min="0"
              class="form-control"
              [class.is-invalid]="initQtyControl?.invalid && (initQtyControl?.dirty || initQtyControl?.touched)"
              formControlName="quantity"
              placeholder="e.g. 50"
            />
            <app-form-error [control]="initQtyControl" fieldName="Quantity"></app-form-error>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="initMin">Minimum Stock Threshold</label>
              <input
                id="initMin"
                type="number"
                min="0"
                class="form-control"
                [class.is-invalid]="initMinControl?.invalid && (initMinControl?.dirty || initMinControl?.touched)"
                formControlName="minimumStock"
                placeholder="e.g. 5"
              />
              <app-form-error [control]="initMinControl" fieldName="Minimum Stock"></app-form-error>
            </div>

            <div class="form-group">
              <label class="form-label" for="initMax">Maximum Stock Limit</label>
              <input
                id="initMax"
                type="number"
                min="1"
                class="form-control"
                [class.is-invalid]="initMaxControl?.invalid && (initMaxControl?.dirty || initMaxControl?.touched)"
                formControlName="maximumStock"
                placeholder="e.g. 500"
              />
              <app-form-error [control]="initMaxControl" fieldName="Maximum Stock"></app-form-error>
            </div>
          </div>
        </form>

        <div modal-footer>
          <app-button variant="secondary" (clicked)="isInitModalOpen.set(false)">Cancel</app-button>
          <app-button
            variant="primary"
            [disabled]="initForm.invalid || isSubmitting()"
            [loading]="isSubmitting()"
            (clicked)="submitInitInventory()"
          >
            Save Inventory
          </app-button>
        </div>
      </app-modal>

      <!-- Adjust Quantity Modal (Increase / Decrease) -->
      <app-modal
        [isOpen]="isAdjustModalOpen()"
        [title]="adjustAction() === 'increase' ? 'Increase Stock: ' + selectedProduct()?.name : 'Decrease Stock: ' + selectedProduct()?.name"
        (closed)="isAdjustModalOpen.set(false)"
      >
        <form [formGroup]="adjustForm" (ngSubmit)="submitAdjustStock()" novalidate>
          <div class="form-group">
            <label class="form-label" for="adjustQty">
              Quantity to {{ adjustAction() === 'increase' ? 'Add' : 'Deduct' }}
            </label>
            <input
              id="adjustQty"
              type="number"
              min="1"
              class="form-control"
              [class.is-invalid]="adjustQtyControl?.invalid && (adjustQtyControl?.dirty || adjustQtyControl?.touched)"
              formControlName="quantity"
              placeholder="e.g. 10"
            />
            <app-form-error [control]="adjustQtyControl" fieldName="Quantity"></app-form-error>
          </div>
        </form>

        <div modal-footer>
          <app-button variant="secondary" (clicked)="isAdjustModalOpen.set(false)">Cancel</app-button>
          <app-button
            [variant]="adjustAction() === 'increase' ? 'primary' : 'danger'"
            [disabled]="adjustForm.invalid || isSubmitting()"
            [loading]="isSubmitting()"
            (clicked)="submitAdjustStock()"
          >
            Confirm {{ adjustAction() === 'increase' ? 'Increase' : 'Decrease' }}
          </app-button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .admin-inventory-page {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .page-header {
      margin-bottom: var(--space-2);
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

    .inventory-actions {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .btn-stock-action {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.35rem 0.65rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
      cursor: pointer;
      background-color: var(--color-bg-surface);
      transition: all var(--transition-fast);
    }

    .btn-init:hover {
      background-color: var(--color-bg-muted);
      border-color: var(--color-brand);
    }

    .btn-inc:hover {
      background-color: var(--color-success-bg);
      border-color: var(--color-success-border);
      color: #065f46;
    }

    .btn-dec:hover {
      background-color: var(--color-danger-bg);
      border-color: var(--color-danger-border);
      color: #991b1b;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }
  `]
})
export default class AdminInventoryListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly inventoryService = inject(AdminInventoryService);
  private readonly fb = inject(FormBuilder);
  private readonly notification = inject(NotificationService);

  products = signal<ProductResponse[]>([]);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);
  currentPage = signal<number>(0);
  loading = signal<boolean>(true);

  isInitModalOpen = signal<boolean>(false);
  isAdjustModalOpen = signal<boolean>(false);
  selectedProduct = signal<ProductResponse | null>(null);
  adjustAction = signal<'increase' | 'decrease'>('increase');
  isSubmitting = signal<boolean>(false);

  initForm = this.fb.group({
    quantity: [10, [Validators.required, Validators.min(0)]],
    minimumStock: [5, [Validators.required, Validators.min(0)]],
    maximumStock: [500, [Validators.required, Validators.min(1)]]
  });

  adjustForm = this.fb.group({
    quantity: [5, [Validators.required, Validators.min(1)]]
  });

  get initQtyControl() { return this.initForm.get('quantity'); }
  get initMinControl() { return this.initForm.get('minimumStock'); }
  get initMaxControl() { return this.initForm.get('maximumStock'); }
  get adjustQtyControl() { return this.adjustForm.get('quantity'); }

  ngOnInit(): void {
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

  openInitModal(product: ProductResponse): void {
    this.selectedProduct.set(product);
    this.initForm.reset({
      quantity: 10,
      minimumStock: 5,
      maximumStock: 500
    });
    this.isInitModalOpen.set(true);
  }

  openAdjustModal(product: ProductResponse, action: 'increase' | 'decrease'): void {
    this.selectedProduct.set(product);
    this.adjustAction.set(action);
    this.adjustForm.reset({ quantity: 5 });
    this.isAdjustModalOpen.set(true);
  }

  submitInitInventory(): void {
    if (this.initForm.invalid || !this.selectedProduct()) return;

    this.isSubmitting.set(true);
    const prod = this.selectedProduct()!;
    const val = this.initForm.value;

    const request: InventoryRequest = {
      productId: prod.id,
      quantity: Number(val.quantity),
      minimumStock: Number(val.minimumStock),
      maximumStock: Number(val.maximumStock)
    };

    this.inventoryService.createInventory(request).subscribe({
      next: res => {
        this.isSubmitting.set(false);
        this.isInitModalOpen.set(false);
        this.notification.success(`Inventory initialized for ${prod.name} (${res.availableQuantity} available).`);
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  submitAdjustStock(): void {
    if (this.adjustForm.invalid || !this.selectedProduct()) return;

    this.isSubmitting.set(true);
    const prod = this.selectedProduct()!;
    const qty = Number(this.adjustForm.value.quantity);
    const action = this.adjustAction();

    const request$ = action === 'increase'
      ? this.inventoryService.increaseStock(prod.id, qty)
      : this.inventoryService.decreaseStock(prod.id, qty);

    request$.subscribe({
      next: res => {
        this.isSubmitting.set(false);
        this.isAdjustModalOpen.set(false);
        this.notification.success(`Stock adjusted for ${prod.name}. Available: ${res.availableQuantity}.`);
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.fetchProducts();
  }
}
