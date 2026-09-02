import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container error-page">
      <div class="error-code">403</div>
      <app-empty-state
        title="Access Forbidden"
        description="You do not have administrative permissions to view this secure section."
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
      color: var(--color-danger-border);
      line-height: 1;
      margin-bottom: -1.5rem;
    }
  `]
})
export default class ForbiddenComponent {
  navigateHome(): void {
    window.location.href = '/';
  }
}
