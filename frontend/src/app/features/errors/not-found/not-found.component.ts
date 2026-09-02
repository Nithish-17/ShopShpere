import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container error-page">
      <div class="error-code">404</div>
      <app-empty-state
        title="Page Not Found"
        description="The page or resource you are looking for doesn't exist, has been removed, or is temporarily unavailable."
        actionLabel="Return to Storefront"
        (actionClicked)="navigateHome()"
      ></app-empty-state>
    </div>
  `,
  styles: [`
    .error-page {
      padding: var(--space-16) var(--space-4);
      text-align: center;
    }

    .error-code {
      font-size: 6rem;
      font-weight: 800;
      font-family: var(--font-display);
      color: var(--color-border-subtle);
      line-height: 1;
      margin-bottom: -1.5rem;
    }
  `]
})
export default class NotFoundComponent {
  navigateHome(): void {
    window.location.href = '/';
  }
}
