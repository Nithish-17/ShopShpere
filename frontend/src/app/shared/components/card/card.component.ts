import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="card"
      [class.card-interactive]="interactive"
      [class.card-bordered]="bordered"
      [class.p-none]="padding === 'none'"
      [class.p-sm]="padding === 'sm'"
      [class.p-md]="padding === 'md'"
      [class.p-lg]="padding === 'lg'"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .card {
      background-color: var(--color-bg-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast);
      position: relative;
      overflow: hidden;
    }

    .card-bordered {
      border: 1px solid var(--color-border);
    }

    .card-interactive:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
      border-color: var(--color-border-subtle);
    }

    .p-none { padding: 0; }
    .p-sm { padding: var(--space-3); }
    .p-md { padding: var(--space-6); }
    .p-lg { padding: var(--space-8); }
  `]
})
export class CardComponent {
  @Input() interactive = false;
  @Input() bordered = true;
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
}
