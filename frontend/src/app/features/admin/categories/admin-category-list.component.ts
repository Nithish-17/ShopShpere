import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../products/services/category.service';
import { CategoryResponse, CategoryRequest } from '../../../core/models';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-category-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    ModalComponent,
    SpinnerComponent,
    FormErrorComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-categories-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Category Taxonomies</h1>
          <p class="page-subtitle">Manage store categories, departments, and metadata</p>
        </div>
        <app-button variant="primary" (clicked)="openCreateModal()">
          + Add New Category
        </app-button>
      </div>

      @if (loading()) {
        <app-spinner [fullPage]="true" message="Loading categories..."></app-spinner>
      } @else {
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (cat of categories(); track cat.id) {
                <tr>
                  <td>#{{ cat.id }}</td>
                  <td class="font-bold">{{ cat.name }}</td>
                  <td>{{ cat.description || 'No description provided' }}</td>
                  <td>
                    <div class="actions-group">
                      <button type="button" class="btn-action-icon" (click)="openEditModal(cat)" title="Edit Category">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button type="button" class="btn-action-icon text-danger" (click)="deleteCategory(cat.id)" title="Delete Category">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Add/Edit Category Modal -->
      <app-modal
        [isOpen]="isModalOpen()"
        [title]="editingCategoryId() ? 'Edit Category #' + editingCategoryId() : 'Add New Category'"
        (closed)="closeModal()"
      >
        <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()" id="catForm" novalidate>
          <div class="form-group">
            <label class="form-label" for="catName">Category Name</label>
            <input
              id="catName"
              type="text"
              class="form-control"
              [class.is-invalid]="nameControl?.invalid && (nameControl?.dirty || nameControl?.touched)"
              formControlName="name"
              placeholder="e.g. Laptops & Ultrabooks"
            />
            <app-form-error [control]="nameControl" fieldName="Category Name"></app-form-error>
          </div>

          <div class="form-group">
            <label class="form-label" for="catDesc">Description</label>
            <textarea
              id="catDesc"
              rows="3"
              class="form-control"
              formControlName="description"
              placeholder="Brief summary of items in this department..."
            ></textarea>
          </div>
        </form>

        <div modal-footer>
          <app-button variant="secondary" (clicked)="closeModal()">Cancel</app-button>
          <app-button
            variant="primary"
            [disabled]="categoryForm.invalid || isSaving()"
            [loading]="isSaving()"
            (clicked)="saveCategory()"
          >
            {{ editingCategoryId() ? 'Save Changes' : 'Create Category' }}
          </app-button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .admin-categories-page {
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
  `]
})
export default class AdminCategoryListComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(FormBuilder);
  private readonly notification = inject(NotificationService);

  categories = signal<CategoryResponse[]>([]);
  loading = signal<boolean>(true);
  isModalOpen = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  editingCategoryId = signal<number | null>(null);

  categoryForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['']
  });

  get nameControl() { return this.categoryForm.get('name'); }

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories(): void {
    this.loading.set(true);
    this.categoryService.getAllCategories(true).subscribe({
      next: cats => {
        this.categories.set(cats);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreateModal(): void {
    this.editingCategoryId.set(null);
    this.categoryForm.reset({
      name: '',
      description: ''
    });
    this.isModalOpen.set(true);
  }

  openEditModal(category: CategoryResponse): void {
    this.editingCategoryId.set(category.id);
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description || ''
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formVal = this.categoryForm.value;
    const request: CategoryRequest = {
      name: formVal.name!,
      description: formVal.description || ''
    };

    const editId = this.editingCategoryId();

    if (editId) {
      this.categoryService.updateCategory(editId, request).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.isModalOpen.set(false);
          this.notification.success(`Category #${editId} updated.`);
          this.fetchCategories();
        },
        error: () => this.isSaving.set(false)
      });
    } else {
      this.categoryService.createCategory(request).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.isModalOpen.set(false);
          this.notification.success('Category created successfully.');
          this.fetchCategories();
        },
        error: () => this.isSaving.set(false)
      });
    }
  }

  deleteCategory(categoryId: number): void {
    if (confirm(`Are you sure you want to delete category #${categoryId}?`)) {
      this.categoryService.deleteCategory(categoryId).subscribe({
        next: () => {
          this.notification.info(`Category #${categoryId} deleted.`);
          this.fetchCategories();
        }
      });
    }
  }
}
