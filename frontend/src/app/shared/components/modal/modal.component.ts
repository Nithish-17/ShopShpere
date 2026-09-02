import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)">
        <div
          class="modal-dialog"
          [class.modal-sm]="size === 'sm'"
          [class.modal-md]="size === 'md'"
          [class.modal-lg]="size === 'lg'"
          (click)="$event.stopPropagation()"
          role="dialog"
          aria-modal="true"
        >
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button type="button" class="btn-close" (click)="close()" aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <ng-content></ng-content>
          </div>

          @if (showFooter) {
            <div class="modal-footer">
              <ng-content select="[modal-footer]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--space-4);
      animation: fadeIn 0.2s ease-out;
    }

    .modal-dialog {
      background-color: var(--color-bg-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--color-border);
      animation: modalSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-sm { max-width: 400px; }
    .modal-md { max-width: 580px; }
    .modal-lg { max-width: 800px; }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-5) var(--space-6);
      border-bottom: 1px solid var(--color-border);
    }

    .modal-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .btn-close {
      background: none;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: var(--space-1);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color var(--transition-fast), background-color var(--transition-fast);
    }

    .btn-close:hover {
      color: var(--color-text-primary);
      background-color: var(--color-bg-muted);
    }

    .modal-body {
      padding: var(--space-6);
      overflow-y: auto;
    }

    .modal-footer {
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--color-border);
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      background-color: var(--color-bg-muted);
      border-bottom-left-radius: var(--radius-xl);
      border-bottom-right-radius: var(--radius-xl);
    }

    @keyframes modalSlide {
      from { transform: translateY(12px) scale(0.98); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
  `]
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showFooter = true;
  @Input() closeOnBackdrop = true;

  @Output() closed = new EventEmitter<void>();

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop) {
      this.close();
    }
  }
}
