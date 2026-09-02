import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state">
      <div class="empty-icon-wrapper">
        @if (icon === 'search') {
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        } @else if (icon === 'cart') {
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        } @else if (icon === 'package') {
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        } @else {
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        }
      </div>

      <h3 class="empty-title">{{ title }}</h3>
      @if (description) {
        <p class="empty-desc">{{ description }}</p>
      }

      @if (actionLabel) {
        <div class="empty-action">
          <app-button [variant]="actionVariant" (clicked)="actionClicked.emit()">
            {{ actionLabel }}
          </app-button>
        </div>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--space-12) var(--space-6);
      background-color: var(--color-bg-surface);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-xl);
      max-width: 540px;
      margin: var(--space-6) auto;
    }

    .empty-icon-wrapper {
      width: 4rem;
      height: 4rem;
      border-radius: var(--radius-full);
      background-color: var(--color-bg-muted);
      color: var(--color-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-4);
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: var(--space-2);
    }

    .empty-desc {
      font-size: 0.9375rem;
      color: var(--color-text-secondary);
      line-height: 1.5;
      margin-bottom: var(--space-6);
    }

    .empty-action {
      margin-top: var(--space-2);
    }
  `]
})
export class EmptyStateComponent {
  @Input() title = 'No data found';
  @Input() description = '';
  @Input() icon: 'search' | 'cart' | 'package' | 'default' = 'default';
  @Input() actionLabel = '';
  @Input() actionVariant: 'primary' | 'secondary' | 'outline' = 'primary';

  @Output() actionClicked = new EventEmitter<void>();
}
