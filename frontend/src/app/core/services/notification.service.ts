import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(toast: Omit<Toast, 'id'>): void {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = toast.duration ?? 4500;
    const newToast: Toast = { ...toast, id, duration };

    this._toasts.update(list => [...list, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, title = 'Success'): void {
    this.show({ type: 'success', title, message });
  }

  error(message: string, title = 'Error'): void {
    this.show({ type: 'error', title, message, duration: 6000 });
  }

  warning(message: string, title = 'Warning'): void {
    this.show({ type: 'warning', title, message });
  }

  info(message: string, title = 'Info'): void {
    this.show({ type: 'info', title, message });
  }

  remove(id: string): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }
}
