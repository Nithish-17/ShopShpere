import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="'btn btn-' + variant + ' btn-' + size"
      (click)="onClick($event)"
    >
      @if (loading) {
        <span class="btn-spinner"></span>
      }
      <span class="btn-content" [class.loading-active]="loading">
        <ng-content></ng-content>
      </span>
    </button>
  `,
  styles: [`
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: inherit;
      font-weight: 600;
      border-radius: var(--radius-md);
      border: 1px solid transparent;
      cursor: pointer;
      position: relative;
      transition: all var(--transition-fast);
      outline: none;
      user-select: none;
      white-space: nowrap;
      text-decoration: none;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Sizes */
    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.8125rem;
      gap: 0.375rem;
    }
    .btn-md {
      padding: 0.625rem 1.25rem;
      font-size: 0.9375rem;
      gap: 0.5rem;
    }
    .btn-lg {
      padding: 0.875rem 1.75rem;
      font-size: 1.0625rem;
      gap: 0.625rem;
    }

    /* Variants */
    .btn-primary {
      background-color: var(--color-brand);
      color: var(--color-text-inverse);
      box-shadow: var(--shadow-sm);
    }
    .btn-primary:hover:not(:disabled) {
      background-color: var(--color-brand-light);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }
    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-secondary {
      background-color: var(--color-bg-muted);
      color: var(--color-text-primary);
      border-color: var(--color-border);
    }
    .btn-secondary:hover:not(:disabled) {
      background-color: #e2e8f0;
    }

    .btn-outline {
      background-color: transparent;
      color: var(--color-text-primary);
      border-color: var(--color-border-subtle);
    }
    .btn-outline:hover:not(:disabled) {
      border-color: var(--color-brand);
      background-color: var(--color-bg-muted);
    }

    .btn-danger {
      background-color: var(--color-danger);
      color: var(--color-text-inverse);
    }
    .btn-danger:hover:not(:disabled) {
      background-color: #dc2626;
      box-shadow: var(--shadow-sm);
    }

    .btn-ghost {
      background-color: transparent;
      color: var(--color-text-secondary);
    }
    .btn-ghost:hover:not(:disabled) {
      color: var(--color-text-primary);
      background-color: var(--color-bg-muted);
    }

    /* Spinner */
    .btn-spinner {
      position: absolute;
      width: 1.125rem;
      height: 1.125rem;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    .btn-secondary .btn-spinner,
    .btn-outline .btn-spinner,
    .btn-ghost .btn-spinner {
      border-color: rgba(15, 23, 42, 0.2);
      border-top-color: var(--color-brand);
    }

    .loading-active {
      visibility: hidden;
    }
  `]
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;

  @Output() clicked = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}
