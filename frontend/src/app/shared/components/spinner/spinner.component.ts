import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="spinner-container" [class.full-page]="fullPage">
      <div [class]="'spinner spinner-' + size" role="status" aria-label="Loading"></div>
      @if (message) {
        <p class="spinner-message">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-8);
      gap: var(--space-3);
    }

    .spinner-container.full-page {
      min-height: 50vh;
    }

    .spinner {
      border: 3px solid rgba(15, 23, 42, 0.1);
      border-top-color: var(--color-brand);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .spinner-sm { width: 1.25rem; height: 1.25rem; border-width: 2px; }
    .spinner-md { width: 2.25rem; height: 2.25rem; border-width: 3px; }
    .spinner-lg { width: 3.5rem; height: 3.5rem; border-width: 4px; }

    .spinner-message {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-secondary);
    }
  `]
})
export class SpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() fullPage = false;
  @Input() message = '';
}
