import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-error',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (shouldShowError()) {
      <div class="form-error-msg" role="alert">
        {{ getErrorMessage() }}
      </div>
    }
  `,
  styles: [`
    .form-error-msg {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--color-danger);
      margin-top: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      animation: fadeIn 0.15s ease-out;
    }
  `]
})
export class FormErrorComponent {
  @Input() control: AbstractControl | null = null;
  @Input() customError: string | null = null;
  @Input() fieldName = 'Field';

  shouldShowError(): boolean {
    if (this.customError) return true;
    return !!(this.control && this.control.invalid && (this.control.dirty || this.control.touched));
  }

  getErrorMessage(): string {
    if (this.customError) return this.customError;
    if (!this.control || !this.control.errors) return '';

    const errors = this.control.errors;

    if (errors['required']) return `${this.fieldName} is required.`;
    if (errors['email']) return 'Please enter a valid email address.';
    if (errors['minlength']) return `${this.fieldName} must be at least ${errors['minlength'].requiredLength} characters.`;
    if (errors['maxlength']) return `${this.fieldName} cannot exceed ${errors['maxlength'].requiredLength} characters.`;
    if (errors['min']) return `${this.fieldName} must be at least ${errors['min'].min}.`;
    if (errors['max']) return `${this.fieldName} cannot exceed ${errors['max'].max}.`;
    if (errors['pattern']) return `Please enter a valid ${this.fieldName.toLowerCase()}.`;

    return 'Invalid input value.';
  }
}
