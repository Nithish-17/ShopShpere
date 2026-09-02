import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
export type BadgeSize = 'sm' | 'md';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="'badge badge-' + variant + ' badge-' + size">
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      border-radius: var(--radius-full);
      line-height: 1;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .badge-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.6875rem;
    }

    .badge-md {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }

    .badge-default {
      background-color: var(--color-bg-muted);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
    }

    .badge-success {
      background-color: var(--color-success-bg);
      color: #065f46;
      border: 1px solid var(--color-success-border);
    }

    .badge-warning {
      background-color: var(--color-warning-bg);
      color: #92400e;
      border: 1px solid var(--color-warning-border);
    }

    .badge-danger {
      background-color: var(--color-danger-bg);
      color: #991b1b;
      border: 1px solid var(--color-danger-border);
    }

    .badge-info {
      background-color: var(--color-info-bg);
      color: #075985;
      border: 1px solid var(--color-info-border);
    }

    .badge-outline {
      background-color: transparent;
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border-subtle);
    }
  `]
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';
  @Input() size: BadgeSize = 'md';
}
