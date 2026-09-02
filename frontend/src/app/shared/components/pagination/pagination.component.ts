import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (totalPages > 1) {
      <nav class="pagination-nav" aria-label="Pagination">
        <button
          type="button"
          class="page-btn prev-btn"
          [disabled]="currentPage === 0"
          (click)="onPageChange(currentPage - 1)"
          aria-label="Previous page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Previous</span>
        </button>

        <div class="page-numbers">
          @for (page of visiblePages(); track page) {
            @if (page === -1) {
              <span class="page-ellipsis">&hellip;</span>
            } @else {
              <button
                type="button"
                class="page-btn page-num"
                [class.active]="page === currentPage"
                (click)="onPageChange(page)"
              >
                {{ page + 1 }}
              </button>
            }
          }
        </div>

        <button
          type="button"
          class="page-btn next-btn"
          [disabled]="currentPage >= totalPages - 1"
          (click)="onPageChange(currentPage + 1)"
          aria-label="Next page"
        >
          <span>Next</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </nav>
    }
  `,
  styles: [`
    .pagination-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      margin-top: var(--space-8);
      margin-bottom: var(--space-4);
      flex-wrap: wrap;
    }

    .page-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: 0.5rem 0.875rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      background-color: var(--color-bg-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      user-select: none;
    }

    .page-btn:hover:not(:disabled) {
      border-color: var(--color-brand);
      color: var(--color-brand);
      background-color: var(--color-bg-muted);
    }

    .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .page-num {
      min-width: 2.25rem;
      justify-content: center;
      padding: 0.5rem 0.625rem;
    }

    .page-num.active {
      background-color: var(--color-brand);
      color: var(--color-text-inverse);
      border-color: var(--color-brand);
    }

    .page-numbers {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    .page-ellipsis {
      padding: 0 var(--space-2);
      color: var(--color-text-muted);
      font-weight: 600;
    }
  `]
})
export class PaginationComponent {
  @Input() currentPage = 0; // 0-indexed
  @Input() totalPages = 0;

  @Output() pageChange = new EventEmitter<number>();

  visiblePages = computed(() => {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      for (let i = 0; i < total; i++) pages.push(i);
      return pages;
    }

    pages.push(0);
    if (current > 2) pages.push(-1);

    const start = Math.max(1, current - 1);
    const end = Math.min(total - 2, current + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 3) pages.push(-1);
    pages.push(total - 1);

    return pages;
  });

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}
